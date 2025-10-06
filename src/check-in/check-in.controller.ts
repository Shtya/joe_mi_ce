import { Controller, Post, Body, Param, Put, UseGuards, Get, Req, Query } from '@nestjs/common';
import { CheckInService } from './check-in.service';
import { CreateCheckInDto } from 'dto/checkin.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { CRUD } from 'common/crud.service'; 
import { EPermission } from 'enums/Permissions.enum';
import { Permissions } from 'decorators/permissions.decorators';

@UseGuards(AuthGuard)
@Controller('checkins')
export class CheckInController {
  constructor(private readonly checkInService: CheckInService) {}

  @Post()
  @Permissions(EPermission.CHECKIN_CREATE)
  async createCheckIn(@Body() dto: CreateCheckInDto) {
    return await this.checkInService.createCheckIn(dto, dto.userId);
  }

  @Get(':userId')
  @Permissions(EPermission.CHECKIN_READ)
  async getCheckInByUser(@Param('userId') userId: string, @Req() req, @Query() query) {
    return CRUD.findAll(this.checkInService.checkInRepo, 'checkin', query.search, query.page, query.limit, query.sortBy, query.sortOrder, ['journey', 'user'], ['date'], { user: { id: userId } });
  }
}
