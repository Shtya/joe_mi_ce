import { Module } from '@nestjs/common';
import { CheckInService } from './check-in.service';
import { CheckInController } from './check-in.controller';
import { Branch } from 'entities/branch.entity';
import { User } from 'entities/user.entity';
import { Journey } from 'entities/employee/journey.entity';
import { CheckIn } from 'entities/employee/checkin.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Journey, CheckIn, User, Branch])],
  controllers: [CheckInController],
  providers: [CheckInService],
})
export class CheckInModule {}
