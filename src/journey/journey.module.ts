import { Module } from '@nestjs/common';
import { JourneyService } from './journey.service';
import { JourneyController } from './journey.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
 import { User } from 'entities/user.entity';
import { Branch } from 'entities/branch.entity';
 import { JourneyCron } from './journey.cron';
import { Journey } from 'entities/employee/journey.entity';
import { Shift } from 'entities/employee/shift.entity';
import { JourneyPlan } from 'entities/employee/journey_plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Journey, User, Branch, Shift , JourneyPlan ])],
  controllers: [JourneyController],
  providers: [JourneyService, JourneyCron],
})
export class JourneyModule {}
