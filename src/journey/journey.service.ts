import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Raw, Repository } from 'typeorm';
import * as dayjs from 'dayjs';
import { User } from 'entities/user.entity';
import { Branch } from 'entities/branch.entity';
import { Shift } from 'entities/employee/shift.entity';
import { JourneyPlan } from 'entities/employee/journey_plan.entity';
import { Journey, JourneyStatus, JourneyType } from 'entities/employee/journey.entity';
import { CreateJourneyPlanDto, CreateUnplannedJourneyDto } from 'dto/journey.dto';

@Injectable()
export class JourneyService {
  constructor(
    @InjectRepository(JourneyPlan) public readonly journeyPlanRepo: Repository<JourneyPlan>,
    @InjectRepository(Journey) public readonly journeyRepo: Repository<Journey>,
    @InjectRepository(User) public readonly userRepo: Repository<User>,
    @InjectRepository(Branch) public readonly branchRepo: Repository<Branch>,
    @InjectRepository(Shift) public readonly shiftRepo: Repository<Shift>,
  ) {}

  async createPlan(dto: CreateJourneyPlanDto, createdBy: User) {
    // 1. التحقّق من user/branch/shift
    const [user, branch, shift] = await Promise.all([this.userRepo.findOne({ where: { id: dto.userId } }), this.branchRepo.findOne({ where: { id: dto.branchId }, relations: ['project'] }), this.shiftRepo.findOne({ where: { id: dto.shiftId }, relations: ['project'] })]);
    if (!user || !branch || !shift) {
      throw new NotFoundException('User, branch, or shift not found');
    }
    if (branch.project.id !== shift.project.id) {
      throw new ConflictException('Branch and shift must belong to the same project');
    }

    // أ. جلب الخطط القائمة المتداخلة زمنيًا
    const existingPlans = await this.journeyPlanRepo.find({
      where: {
        user: { id: dto.userId },
        branch: { id: dto.branchId },
        shift: { id: dto.shiftId },
        fromDate: LessThanOrEqual(dto.toDate),
        toDate: MoreThanOrEqual(dto.fromDate),
      } as any,
    });

    // ب. إذا لا توجد خطط، ننشئ واحدة جديدة
    if (existingPlans.length === 0) {
      const newPlan = this.journeyPlanRepo.create({
        user,
        branch,
        shift,
        createdBy,
        fromDate: dto.fromDate,
        toDate: dto.toDate,
        days: dto.days,
      });
      return await this.journeyPlanRepo.save(newPlan);
    }

    // ج. التحقّق من التداخل بالأيام والدمج
    for (const plan of existingPlans) {
      // أيام متكررة → خطأ
      const overlapDays = plan.days.filter(d => dto.days.includes(d));
      if (overlapDays.length > 0) {
        throw new ConflictException({
          message: 'Conflict with existing plan days',
          conflict: {
            fromDate: plan.fromDate,
            toDate: plan.toDate,
            overlappingDays: overlapDays,
          },
        });
      }
      // نفس الفترة تمامًا → دمج الأيام
      const samePeriod = plan.fromDate === dto.fromDate && plan.toDate === dto.toDate;
      if (samePeriod) {
        plan.days = Array.from(new Set([...plan.days, ...dto.days]));
        return await this.journeyPlanRepo.save(plan);
      }
    }

    // د. إذا تداخُل زمني بدون مطابقة من–إلى، نعتبره تعارضاً (غير مدعوم)
    throw new ConflictException('Cannot create plan: overlapping period without exact match');
  }

  async createUnplannedJourney(dto: CreateUnplannedJourneyDto, createdBy) {
    const [user, branch, shift] = await Promise.all([this.userRepo.findOne({ where: { id: dto.userId } }), this.branchRepo.findOne({ where: { id: dto.branchId } }), this.shiftRepo.findOne({ where: { id: dto.shiftId } })]);

    // If user, branch, or shift is not found, throw a NotFoundException
    if (!user || !branch || !shift) {
      throw new NotFoundException({
        message: 'User, branch, or shift not found',
      });
    }

    // Check if the unplanned journey already exists for the given user, branch, shift, and date
    const existingJourney = await this.journeyRepo.findOne({
      where: {
        user: { id: dto.userId },
        branch: { id: dto.branchId },
        shift: { id: dto.shiftId },
        date: dto.date,
        type: JourneyType.UNPLANNED,
      },
    });

    // If the journey already exists, throw a ConflictException
    if (existingJourney) {
      throw new ConflictException({
        message: 'Unplanned journey already exists for this user on this day',
      });
    }

    // Create a new unplanned journey if no conflict exists
    const newJourney = this.journeyRepo.create({
      user,
      branch,
      shift,
      date: dto.date,
      type: JourneyType.UNPLANNED,
      status: 'pending',
      createdBy: createdBy, // assuming createdBy is the UUID of the user creating this
    } as any);

    // Save the new journey to the database
    await this.journeyRepo.save(newJourney);

    // Return the created journey
    return newJourney;
  }

  async createJourneysForTomorrow(): Promise<{ createdCount: number; date: string }> {
    const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
    const dayName = dayjs(tomorrow).format('dddd').toLowerCase();

    const plans = await this.journeyPlanRepo.createQueryBuilder('plan').leftJoinAndSelect('plan.user', 'user').leftJoinAndSelect('plan.branch', 'branch').leftJoinAndSelect('branch.project', 'branchProject').leftJoinAndSelect('plan.shift', 'shift').leftJoinAndSelect('shift.project', 'shiftProject').leftJoinAndSelect('plan.createdBy', 'createdBy').where('plan.fromDate <= :tomorrow', { tomorrow }).andWhere('plan.toDate >= :tomorrow', { tomorrow }).andWhere(':dayName = ANY(plan.days)', { dayName }).getMany();

    let createdCount = 0;
    for (const plan of plans) {
      if (plan.branch.project.id !== plan.shift.project.id) continue;
      const exists = await this.journeyRepo.findOne({
        where: { user: { id: plan.user.id }, shift: { id: plan.shift.id }, date: tomorrow, type: JourneyType.PLANNED },
      });
      if (exists) continue;
      const journey = this.journeyRepo.create({
        user: plan.user,
        branch: plan.branch,
        shift: plan.shift,
        date: tomorrow,
        type: JourneyType.PLANNED,
        status: JourneyStatus.PENDING,
        createdBy: plan.createdBy,
        journeyPlan: plan,
      });
      await this.journeyRepo.save(journey);
      createdCount++;
    }
    return { createdCount, date: tomorrow };
  }

}
