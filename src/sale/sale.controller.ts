import { Controller, Get, Post, Body, Param, Patch, Delete, Query, Res, UseGuards } from '@nestjs/common';
import { SaleService } from './sale.service';
import { CreateSaleDto, UpdateSaleDto } from 'dto/sale.dto';
import { CRUD } from 'common/crud.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Permissions } from 'decorators/permissions.decorators';
import { EPermission } from 'enums/Permissions.enum';

@UseGuards(AuthGuard)
@Controller('sales')
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  // 🔹 Export sales data to Excel
  @Get('/export')
  @Permissions(EPermission.SALE_EXPORT)
  async exportData(@Query('limit') limit: number, @Res() res: any) {
    return CRUD.exportEntityToExcel(this.saleService.saleRepo, 'sale', res, { exportLimit: limit });
  }

  // 🔹 Create a new sale
  @Post()
  @Permissions(EPermission.SALE_CREATE)
  create(@Body() dto: CreateSaleDto) {
    return this.saleService.create(dto);
  }

  // 🔹 Get all sales
  @Get()
  @Permissions(EPermission.SALE_READ)
  findAll(@Query() query: any) {
    return CRUD.findAll(this.saleService.saleRepo, 'sale', query.search, query.page, query.limit, query.sortBy, query.sortOrder, [], ['status'], {});
  }

  // 🔹 Get sale by ID
  @Get(':id')
  @Permissions(EPermission.SALE_READ)
  findOne(@Param('id') id: number) {
    return CRUD.findOne(this.saleService.saleRepo, 'sale', id, ['product', 'user', 'branch']);
  }

  // 🔹 Delete sale
  @Delete(':id')
  @Permissions(EPermission.SALE_DELETE)
  remove(@Param('id') id: number) {
    return CRUD.softDelete(this.saleService.saleRepo, 'sale', id);
  }

  // 🔹 Cancel or return a sale
  @Post(':id/return')
  @Permissions(EPermission.SALE_RETURN)
  cancelOrReturn(@Param('id') id: number) {
    return this.saleService.cancelOrReturn(id);
  }

  // 🔹 Get sales by branch
  @Get('by-branch/:branchId')
  @Permissions(EPermission.SALE_READ)
  findByBranch(@Param('branchId') branchId: number, @Query() query: any) {
    return CRUD.findAll(this.saleService.saleRepo, 'sale', query.search, query.page, query.limit, query.sortBy, query.sortOrder, ['branch'], ['status'], { branch: { id: branchId } });
  }

  // 🔹 Get sales by product
  @Get('by-product/:productId')
  @Permissions(EPermission.SALE_READ)
  findByProduct(@Param('productId') productId: number, @Query() query: any) {
    return CRUD.findAll(this.saleService.saleRepo, 'sale', query.search, query.page, query.limit, query.sortBy, query.sortOrder, ['product'], ['status'], { product: { id: productId } });
  }

  // 🔹 Get sales by user
  @Get('by-user/:userId')
  @Permissions(EPermission.SALE_READ)
  findByUser(@Param('userId') userId: number, @Query() query: any) {
    return CRUD.findAll(this.saleService.saleRepo, 'sale', query.search, query.page, query.limit, query.sortBy, query.sortOrder, ['user'], ['status'], { user: { id: userId } });
  }
}
