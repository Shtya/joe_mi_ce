import { Controller, Post, Body, Param, Put, UseGuards, Get, Req, Query } from '@nestjs/common';
import { CheckInService } from './check-in.service';
import { CreateCheckInDto } from 'dto/checkin.dto';
import { GeoLocation } from 'entities/geo.embeddable';
import { AuthGuard } from 'src/auth/auth.guard';
import { CRUD } from 'common/crud.service';

@UseGuards(AuthGuard)
@Controller('checkins')
export class CheckInController {
  constructor(private readonly checkInService: CheckInService) {}

  @Post()
  async createCheckIn(@Body() dto: CreateCheckInDto) {
    return await this.checkInService.createCheckIn(dto, dto.userId);
  }
 

  @Get(':userId')
  async getCheckInByUser(@Param('userId') userId: string , @Req() req , @Query() query) {
          return CRUD.findAll(this.checkInService.checkInRepo , 
            "checkin" , 
            query.search, 
            query.page, 
            query.limit, 
            query.sortBy, 
            query.sortOrder, 
            ['journey', 'user' ], 
            ['date'], 
            {user : {id : userId}}
          );
    }
}