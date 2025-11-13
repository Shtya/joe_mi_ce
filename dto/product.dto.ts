import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

class StockDto {
  @IsOptional()
  branch_id?: number;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsBoolean()
  all_branches?: boolean;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  discount?: number;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsBoolean()
  is_high_priority?: boolean;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsNotEmpty()
  project_id: number;

  @IsOptional()
  brand_id?: number;

  @IsNotEmpty()
  category_id: number;

  @IsOptional()
  @IsArray()
  stock?: StockDto[];
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class GetProductsByBranchDto {
  @IsNotEmpty()
  branch_id: string;
}
