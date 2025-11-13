
// src/journey/dto/create-journey-plan.dto.ts
import { IsUUID, IsDateString, IsArray, IsEnum } from 'class-validator';

export class CreateJourneyPlanDto {

  
  userId: number;

  
  branchId: number;

  
  shiftId: number;

  @IsDateString()
  fromDate: string;

  @IsDateString()
  toDate: string;

  @IsArray()
  @IsEnum(['sunday','monday','tuesday','wednesday','thursday','friday','saturday'], { each: true })
  days: string[];
}

// src/journey/dto/update-journey-plan.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { JourneyType } from 'entities/employee/journey.entity';
 
export class UpdateJourneyPlanDto extends PartialType(CreateJourneyPlanDto) {}


// create-unplanned-journey.dto.ts

  
export class CreateUnplannedJourneyDto {
  
  userId: number;

  
  branchId: number;

  
  shiftId: number;

  @IsDateString()
  date: string;

  @IsEnum(JourneyType)
  type: JourneyType = JourneyType.UNPLANNED;

}
