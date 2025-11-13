// dto/create-branch.dto.ts
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

class GeoDto {
  lat: number;
  lng: number;
}

 

export class AssignPromoterDto {
  promoterId: any;
}

export class CreateBranchDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  geo: GeoDto;

  @IsNumber()
  @IsOptional()
  geofence_radius_meters?: number = 500;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsString()
  cityId: number;

  @IsNumber()
  @IsOptional()
  chainId?: number;

   @IsString()
  @IsOptional()
  supervisorId?: number;

  @IsArray()
  @IsOptional()
  teamIds?: number[];
}


import { PartialType } from '@nestjs/mapped-types';
 
export class UpdateBranchDto extends PartialType(CreateBranchDto) {}