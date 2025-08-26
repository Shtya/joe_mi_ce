import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query } from '@nestjs/common';

import { CreateProductDto, GetProductsByBranchDto, UpdateProductDto } from 'dto/product.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { CRUD } from 'common/crud.service';
import { PaginationQueryDto } from 'dto/pagination.dto';
import { ProductService } from 'src/product/product.service';

@UseGuards(AuthGuard)
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return CRUD.findAll(this.productService.productRepository, 'product', query.search, query.page, query.limit, query.sortBy, query.sortOrder, ['category', 'stock', 'brand'], ['name'], query.filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return CRUD.softDelete(this.productService.productRepository, 'product', id )
  }

  @Get('by-category/:categoryId')
  getProductsByCategory(@Param('categoryId') categoryId: string) {
    return this.productService.getProductsByCategory(categoryId);
  }

  @Get('by-brand/:brandId')
  getProductsByBrand(@Param('brandId') brandId: string) {
    return this.productService.getProductsByBrand(brandId);
  }

  @Get('by-project/:projectId')
  getProductsByProject(@Param('projectId') projectId: string) {
    return this.productService.getProductsByProject(projectId);
  }
 
}
