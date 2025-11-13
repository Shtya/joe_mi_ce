import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query } from '@nestjs/common';
import { CreateProductDto, GetProductsByBranchDto, UpdateProductDto } from 'dto/product.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { CRUD } from 'common/crud.service';
import { PaginationQueryDto } from 'dto/pagination.dto';
import { ProductService } from 'src/product/product.service';
import { Permissions } from 'decorators/permissions.decorators';
import { EPermission } from 'enums/Permissions.enum';

@UseGuards(AuthGuard)
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @Permissions(EPermission.PRODUCT_CREATE)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  @Permissions(EPermission.PRODUCT_READ)
  findAll(@Query() query: PaginationQueryDto) {
    return CRUD.findAll(this.productService.productRepository, 'product', query.search, query.page, query.limit, query.sortBy, query.sortOrder, ['category', 'stock', 'brand'], ['name'], query.filters);
  }

  @Get(':id')
  @Permissions(EPermission.PRODUCT_READ)
  findOne(@Param('id') id: number) {
    return this.productService.findOne(id);
  }

  @Put(':id')
  @Permissions(EPermission.PRODUCT_UPDATE)
  update(@Param('id') id: number, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Permissions(EPermission.PRODUCT_DELETE)
  remove(@Param('id') id: number) {
    return CRUD.softDelete(this.productService.productRepository, 'product', id);
  }

  @Get('by-category/:categoryId')
  @Permissions(EPermission.PRODUCT_READ)
  getProductsByCategory(@Param('categoryId') categoryId: number) {
    return this.productService.getProductsByCategory(categoryId);
  }

  @Get('by-brand/:brandId')
  @Permissions(EPermission.PRODUCT_READ)
  getProductsByBrand(@Param('brandId') brandId: number) {
    return this.productService.getProductsByBrand(brandId);
  }

  @Get('by-project/:projectId')
  @Permissions(EPermission.PRODUCT_READ)
  getProductsByProject(@Param('projectId') projectId: number) {
    return this.productService.getProductsByProject(projectId);
  }
}
