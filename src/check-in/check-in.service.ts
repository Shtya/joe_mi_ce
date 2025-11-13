import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from 'entities/branch.entity';
import { GeoLocation } from 'entities/geo.embeddable';
import { getDistance } from 'geolib';
import { CheckIn } from 'entities/employee/checkin.entity';
import { Journey } from 'entities/employee/journey.entity';
import { CreateCheckInDto } from 'dto/checkin.dto';
import * as dayjs from 'dayjs';

@Injectable()
export class CheckInService {
  constructor(
    @InjectRepository(CheckIn) public readonly checkInRepo: Repository<CheckIn>,
    @InjectRepository(Journey) public readonly journeyRepo: Repository<Journey>,
    @InjectRepository(Branch) public readonly branchRepo: Repository<Branch>,
  ) {}

  private isWithinGeofence(branch: Branch, geo: GeoLocation): boolean {
    const distance = getDistance({ latitude: branch.geo.lat, longitude: branch.geo.lng }, { latitude: geo.lat, longitude: geo.lng });
    return distance <= branch.geofence_radius_meters;
  }

  async createCheckIn(dto: CreateCheckInDto, userId: number) {
    const journey: Journey = await this.journeyRepo.findOne({
      where: { id: dto.journeyId, user: { id: userId } },
      relations: ['branch', 'shift'],
    });

    if (!journey) {
      throw new NotFoundException('Journey not found');
    }

    const branch = await this.branchRepo.findOne({ where: { id: journey.branch.id } });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    if (!this.isWithinGeofence(branch, dto.geo)) {
      throw new ConflictException('User is not within the allowed geofence radius for this branch');
    }

    if (!dto.checkInTime && !dto.checkOutTime) {
      throw new ConflictException('Either check-in time or check-out time must be provided');
    }

    // Validate if the check-in time is on the same day as the journey
    const journeyDate = dayjs(journey.date);
    const checkInDate = dayjs(dto.checkInTime);

    console.log(journeyDate , checkInDate);
    if (!checkInDate.isSame(journeyDate, 'day')) {
      throw new ConflictException('Check-in time must be on the same day as the journey');
    }

    let checkIn = await this.checkInRepo.findOne({
      where: { journey: { id: dto.journeyId } },
      relations: ['journey'],
    });

    if (checkIn) {
      // Update the check-in record
      checkIn.checkInTime = dto.checkInTime || checkIn.checkInTime;
      checkIn.checkOutTime = dto.checkOutTime || checkIn.checkOutTime;
      checkIn.geo = dto.geo;
      checkIn.image = dto.image;
      checkIn.note = dto.note;
      checkIn.isWithinRadius = this.isWithinGeofence(branch, dto.geo);
    } else {
      // Create a new check-in record if it doesn't exist
      checkIn = this.checkInRepo.create({
        journey,
        checkInTime: dto.checkInTime || null,
        checkOutTime: dto.checkOutTime || null,
        geo: dto.geo,
        image: dto.image,
        note: dto.note,
        isWithinRadius: this.isWithinGeofence(branch, dto.geo),
        user: { id: userId },
      });
    }

    if (dto.checkOutTime && !dto.checkInTime) {
      throw new ConflictException('Check-out time cannot be provided without check-in time');
    }

    if (dto.checkOutTime) {
      const shift = journey.shift;
      const checkOutTime = dayjs(dto.checkOutTime);
      const shiftEndTime = dayjs(`${journey.date} ${shift.endTime}`);

      const diffHours = checkOutTime.diff(shiftEndTime, 'hour');
      if (diffHours > 4) {
        throw new ConflictException('Check-out time is more than 4 hours after shift end time');
      }
    }

    try {
      return await this.checkInRepo.save(checkIn);
    } catch (error) {
      throw new ConflictException('An unexpected database error occurred');
    }
  }
}
