import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsEnum, IsDateString, IsUUID, IsOptional } from 'class-validator';

export class UpdateVacationDto {
  @IsString()
  @IsOptional()
  reason: string;

  @IsEnum(['approved', 'rejected'])
  @IsOptional()
  status: string;

  @IsOptional()
  processedById: number;

  @IsDateString()
  @IsOptional()
  processedAt: Date;

  @IsDateString()
  start_date: Date;

  @IsDateString()
  end_date: Date;
}

export class CreateVacationDto {
  userId: number;

  branchId: number;

  @IsDateString()
  start_date: Date;

  @IsDateString()
  end_date: Date;

  @IsString()
  reason: string;
}
