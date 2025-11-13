import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto, UpdateBrandDto } from 'dto/brand.dto';
import { PaginationQueryDto } from 'dto/pagination.dto';
import { CRUD } from 'common/crud.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Permissions } from 'decorators/permissions.decorators';
import { EPermission } from 'enums/Permissions.enum';

@UseGuards(AuthGuard)
@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  @Permissions(EPermission.BRAND_CREATE)
  create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandService.create(createBrandDto);
  }

  @Get()
  @Permissions(EPermission.BRAND_READ)
  findAll(@Query() query: PaginationQueryDto) {
    return CRUD.findAll(this.brandService.brandRepository, 'brand', query.search, query.page, query.limit, query.sortBy, query.sortOrder, [], ['name'], query.filters);
  }

  @Get(':id')
  @Permissions(EPermission.BRAND_READ)
  findOne(@Param('id') id: number) {
    return this.brandService.findOne(id);
  }

  @Put(':id')
  @Permissions(EPermission.BRAND_UPDATE)
  update(@Param('id') id: number, @Body() updateBrandDto: UpdateBrandDto) {
    return this.brandService.update(id, updateBrandDto);
  }

  @Delete(':id')
  @Permissions(EPermission.BRAND_DELETE)
  remove(@Param('id') id: number) {
    return CRUD.delete(this.brandService.brandRepository, 'brand', id);
  }
}
