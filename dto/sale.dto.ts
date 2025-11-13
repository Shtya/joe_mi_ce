import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber, Min, IsEnum, IsUUID } from 'class-validator';

export class CreateSaleDto {
  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsEnum(['completed', 'returned', 'canceled'])
  status: string;

  productId: number;

  userId: number;

  branchId: number;
}

export class UpdateSaleDto extends PartialType(CreateSaleDto) {}
