import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards, Query, BadRequestException } from '@nestjs/common';
import { StockService } from './stock.service';
import { CreateStockDto, UpdateStockDto } from 'dto/stock.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { PaginationQueryDto } from 'dto/pagination.dto';
import { CRUD } from 'common/crud.service';
import { Permissions } from 'decorators/permissions.decorators';
import { EPermission } from 'enums/Permissions.enum';

@UseGuards(AuthGuard)
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  // 🔹 Create or update stock (upsert)
  @Post('upsert')
  @Permissions(EPermission.STOCK_CREATE, EPermission.STOCK_UPDATE)
  async createOrUpdate(@Body() dto: CreateStockDto) {
    return this.stockService.createOrUpdate(dto);
  }

  // 🔹 Get stocks by product
  @Get('product/:productId')
  @Permissions(EPermission.STOCK_READ)
  getStocksByProduct(@Param('productId') productId: number) {
    return this.stockService.getStocksByProduct(productId);
  }

  // 🔹 Get stocks by branch
  @Get('branch/:branchId')
  @Permissions(EPermission.STOCK_READ)
  getStocksByBranch(@Param('branchId') branchId: number) {
    return this.stockService.getStocksByBranch(branchId);
  }

  // 🔹 Smart check for out-of-stock products
  @Get('out-of-stock')
  @Permissions(EPermission.STOCK_ANALYZE)
  async outOfStockSmart(@Query('branchId') branchId?: number, @Query('productId') productId?: number, @Query('threshold') threshold = '0') {
    if (!branchId) {
      throw new BadRequestException('branchId is required');
    }

    const thrNum = Number(threshold);
    const safeThr = Number.isFinite(thrNum) ? thrNum : 0;

    return this.stockService.getOutOfStockSmart({
      branchId,
      productId,
      threshold: safeThr,
    });
  }
}
