import { Controller, Get, Param, Delete, UseGuards, Post, Body, Req, Patch, Query } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { JourneyService } from './journey.service';
import { CreateJourneyPlanDto, CreateUnplannedJourneyDto } from 'dto/journey.dto';
import { CRUD } from 'common/crud.service';
import { Permissions } from 'decorators/permissions.decorators';
import { EPermission } from 'enums/Permissions.enum';

@UseGuards(AuthGuard)
@Controller('journeys')
export class JourneyController {
  constructor(private readonly journeyService: JourneyService) {}

  @Post()
  @Permissions(EPermission.JOURNEY_CREATE)
  async createPlan(@Body() dto: CreateJourneyPlanDto, @Req() req) {
    return this.journeyService.createPlan(dto, req.user);
  }

  @Post('unplanned')
  @Permissions(EPermission.JOURNEY_CREATE)
  async createUnplannedJourney(@Body() createUnplannedJourneyDto: CreateUnplannedJourneyDto, @Req() req) {
    return await this.journeyService.createUnplannedJourney(createUnplannedJourneyDto, req.user);
  }
  @Get('by-user')
  @Permissions(EPermission.JOURNEY_READ)
  async findByUser( @Req() req, @Query() query) {
    const userId = req.user.id;
    const journeys = await this.journeyService.journeyRepo.find({
      where: { user: { id: userId } },
      relations: ['branch', 'shift', 'user'],
      order: { date: query.sortOrder === 'ASC' ? 'ASC' : 'DESC' },
    });
    const customizedJourneys = journeys.map(j => ({
      id: j.id,
      date: j.date,
      branchName: j.branch?.name,
      shiftName: j.shift?.name,
      user: j.user,
      status: j.status,
      checkIn: j.shift.startTime,
      checkOut: j.shift.endTime,
      location: j.branch.geo
      
    }));
    return customizedJourneys;
  }

  @Get('by-branch/:branchId')
  @Permissions(EPermission.JOURNEY_READ)
  async findByBranch(@Param('branchId') branchId: string, @Req() req, @Query() query) {
    return CRUD.findAll(this.journeyService.journeyRepo, 'journey', query.search, query.page, query.limit, query.sortBy, query.sortOrder, ['branch', 'shift', 'user'], ['date'], { branch: { id: branchId } });
  }

  @Get('by-shift/:shiftId')
  @Permissions(EPermission.JOURNEY_READ)
  async findJourneysByShift(@Param('shiftId') shiftId: string, @Req() req, @Query() query) {
    return CRUD.findAll(this.journeyService.journeyRepo, 'journey', query.search, query.page, query.limit, query.sortBy, query.sortOrder, ['branch', 'shift', 'user'], ['date'], { shift: { id: shiftId } });
  }

  /**
   * GET /journeys/plans/by-shift/:shiftId
   * يرجّع JourneyPlans المرتبطة بـ shift معيّن
   */
  @Get('plans/by-shift/:shiftId')
  @Permissions(EPermission.JOURNEY_READ)
  async findJourneyPlansByShift(@Param('shiftId') shiftId: string, @Req() req, @Query() query) {
    return CRUD.findAll(this.journeyService.journeyPlanRepo, 'journey_plan', query.search, query.page, query.limit, query.sortBy, query.sortOrder, ['shift', 'branch', 'user', 'createdBy'], ['fromDate', 'toDate'], { shift: { id: shiftId } });
  }

  @Get(':id')
  @Permissions(EPermission.JOURNEY_READ)
  async getOne(@Param('id') id: string) {
    return CRUD.findOne(this.journeyService.journeyRepo, 'journey', id, ['user', 'branch', 'shift', 'checkin', 'createdBy']);
  }

  @Delete(':id')
  @Permissions(EPermission.JOURNEY_DELETE)
  async remove(@Param('id') id: string) {
    return CRUD.delete(this.journeyService.journeyRepo, 'journey', id);
  }

  @Patch('cron/test-create-tomorrow')
  @Permissions(EPermission.JOURNEY_UPDATE)
  async testCronCreateTomorrow() {
    return this.journeyService.createJourneysForTomorrow();
  }
}
