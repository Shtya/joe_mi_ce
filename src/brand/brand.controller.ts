import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common'; 
import { BrandService } from './brand.service';
import { CreateBrandDto, UpdateBrandDto } from 'dto/brand.dto';
import { PaginationQueryDto } from 'dto/pagination.dto';
import { CRUD } from 'common/crud.service';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandService.create(createBrandDto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return CRUD.findAll(
      this.brandService.brandRepository,
      'brand',
      query.search,
      query.page,
      query.limit,
      query.sortBy,
      query.sortOrder,
      [],
      ['name'],
      query.filters,
    );
   }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brandService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
    return this.brandService.update(id, updateBrandDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return CRUD.delete(this.brandService.brandRepository , "brand" , id)
  }
}