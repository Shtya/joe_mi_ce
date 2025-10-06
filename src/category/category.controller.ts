import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from 'dto/category.dto';
import { PaginationQueryDto } from 'dto/pagination.dto';
import { CRUD } from 'common/crud.service';
import { AuthGuard } from 'src/auth/auth.guard'; 
import { Permissions } from 'decorators/permissions.decorators';
import { EPermission } from 'enums/Permissions.enum';

@UseGuards(AuthGuard)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @Permissions(EPermission.CATEGORY_CREATE)
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @Permissions(EPermission.CATEGORY_READ)
  findAll(@Query() query: PaginationQueryDto) {
    return CRUD.findAll(this.categoryService.categoryRepository, 'category', query.search, query.page, query.limit, query.sortBy, query.sortOrder, [], ['name'], query.filters);
  }

  @Get(':id')
  @Permissions(EPermission.CATEGORY_READ)
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Put(':id')
  @Permissions(EPermission.CATEGORY_UPDATE)
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @Permissions(EPermission.CATEGORY_DELETE)
  remove(@Param('id') id: string) {
    return CRUD.delete(this.categoryService.categoryRepository, 'category', id);
  }
}
