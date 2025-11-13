import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsUUID, IsInt, IsString, IsOptional } from 'class-validator';

export class CreateStockDto {
  @IsNotEmpty()
  product_id: number;

  @IsNotEmpty()
  branch_id: number;

  @IsInt()
  @IsNotEmpty()
  quantity: number;

}

export class UpdateStockDto extends PartialType(CreateStockDto) {}
