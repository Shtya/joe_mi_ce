import { IsNotEmpty, IsString, IsMilitaryTime, IsUUID } from 'class-validator';

export class CreateShiftDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsMilitaryTime()
  startTime: string;

  @IsMilitaryTime()
  endTime: string;

  projectId: number;
}
import { PartialType } from '@nestjs/mapped-types';

export class UpdateShiftDto extends PartialType(CreateShiftDto) {}
