import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards, Query } from '@nestjs/common';
import { StockService } from './stock.service';
import { CreateStockDto, UpdateStockDto } from 'dto/stock.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { PaginationQueryDto } from 'dto/pagination.dto';
import { CRUD } from 'common/crud.service';

@UseGuards(AuthGuard)
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

 
@Post('upsert')
async createOrUpdate(@Body() dto: CreateStockDto)  {
  return this.stockService.createOrUpdate(dto);
}

  @Get('product/:productId')
  getStocksByProduct(@Param('productId') productId: string) {
    return this.stockService.getStocksByProduct(productId);
  }

  @Get('branch/:branchId')
  getStocksByBranch(@Param('branchId') branchId: string) {
    return this.stockService.getStocksByBranch(branchId);
  }
}
