import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
 import { ShiftService } from './shift.service';
import { ShiftController } from './shift.controller';
import { Project } from 'entities/project.entity';
import { Shift } from 'entities/employee/shift.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shift, Project])],
  controllers: [ShiftController],
  providers: [ShiftService],
})
export class ShiftModule {}
