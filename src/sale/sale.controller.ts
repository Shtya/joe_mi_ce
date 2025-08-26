import { Controller, Get, Post, Body, Param, Patch, Delete, Query, Res } from '@nestjs/common';
import { SaleService } from './sale.service';
import { CreateSaleDto, UpdateSaleDto } from 'dto/sale.dto';
import { CRUD } from 'common/crud.service';

@Controller('sales')
export class SaleController {
  constructor(private readonly saleService: SaleService) {}


  @Get('/export')
    async exportData(  @Query('limit') limit: number, @Res() res: any ) {
    return CRUD.exportEntityToExcel( this.saleService.saleRepo, 'sale', res, { exportLimit : limit } );
  }



  @Post()
  create(@Body() dto: CreateSaleDto) {
    return this.saleService.create(dto);
  }

  @Get()
  findAll(@Query() query: any) {
    return CRUD.findAll(
      this.saleService.saleRepo,
      'sale',
      query.search,
      query.page,
      query.limit,
      query.sortBy,
      query.sortOrder,
      [], // relation
      ["status"], // search
      {}, // filter
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return CRUD.findOne(this.saleService.saleRepo, 'sale', id , ['product', 'user', 'branch']);
  }


  @Delete(':id')
  remove(@Param('id') id: string) {
    return CRUD.softDelete(this.saleService.saleRepo, 'sale', id);
  }

  @Post(':id/return')
  cancelOrReturn(@Param('id') id: string) {
    return this.saleService.cancelOrReturn(id);
  }



  @Get('by-branch/:branchId')
  findByBranch(@Param('branchId') branchId: string , @Query() query:any) {
    return CRUD.findAll(
      this.saleService.saleRepo,
      'sale',
      query.search,
      query.page,
      query.limit,
      query.sortBy,
      query.sortOrder,
      ["branch"], // relation
      ["status"], // search"
      {branch : {id : branchId}}, // filter
    );
  }

  @Get('by-product/:productId')
  findByProduct(@Param('productId') productId: string , @Query() query:any) {
    return CRUD.findAll(
      this.saleService.saleRepo,
      'sale',
      query.search,
      query.page,
      query.limit,
      query.sortBy,
      query.sortOrder,
      ["product"], // relation
      ["status"], // search"
      {product : {id : productId}}, // filter
    );
  }

  @Get('by-user/:userId')
  findByUser(@Param('userId') userId: string , @Query() query:any) {
    return CRUD.findAll(
      this.saleService.saleRepo,
      'sale',
      query.search,
      query.page,
      query.limit,
      query.sortBy,
      query.sortOrder,
      ["user"], // relation
      ["status"], // search"
      {user : {id : userId}}, // filter
    );
  }
}
