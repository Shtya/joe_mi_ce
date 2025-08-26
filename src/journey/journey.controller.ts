import { Controller, Get, Param, Delete, UseGuards, Post, Body, Req, Patch, Query } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { JourneyService } from './journey.service';
import { CreateJourneyPlanDto, CreateUnplannedJourneyDto } from 'dto/journey.dto';
import { CRUD } from 'common/crud.service';

@UseGuards(AuthGuard)
@Controller('journeys')
export class JourneyController {
  constructor(private readonly journeyService: JourneyService) {}

  @Post()
  async createPlan(@Body() dto: CreateJourneyPlanDto, @Req() req) {
    return this.journeyService.createPlan(dto, req.user);
  }

  @Post('unplanned')
  async createUnplannedJourney(
    @Body() createUnplannedJourneyDto: CreateUnplannedJourneyDto,  @Req() req
  )  {
    return await this.journeyService.createUnplannedJourney(createUnplannedJourneyDto , req.user);
  }

  @Get('by-user/:userId')
  async findByUser(@Param('userId') userId: string , @Req() req , @Query() query) {
        return CRUD.findAll(this.journeyService.journeyRepo , 
          "journey" , 
          query.search, 
          query.page, 
          query.limit, 
          query.sortBy, 
          query.sortOrder, 
          ['branch', 'shift' , "user" ], 
          ['date'], 
          {user : {id : userId}}
        );
  }

  
  @Get('by-branch/:branchId')
  async findByBranch(@Param('branchId') branchId: string, @Req() req , @Query() query) {
        return CRUD.findAll(this.journeyService.journeyRepo , 
          "journey" , 
          query.search, 
          query.page, 
          query.limit, 
          query.sortBy, 
          query.sortOrder, 
          ['branch', 'shift' , "user" ], 
          ['date'], 
          {branch : {id : branchId}}
        );

  }

 
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return CRUD.delete(this.journeyService.journeyRepo , "journey" , id)
  }

  @Patch('cron/test-create-tomorrow')
  async testCronCreateTomorrow() {
    return this.journeyService.createJourneysForTomorrow();
  }
}

