import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common'; 
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from 'dto/category.dto';
import { PaginationQueryDto } from 'dto/pagination.dto';
import { CRUD } from 'common/crud.service';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

    @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return CRUD.findAll(
      this.categoryService.categoryRepository,
      'category',
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
    return this.categoryService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  
  @Delete(':id')
  remove(@Param('id') id: string) {
    return CRUD.delete(this.categoryService.categoryRepository , "category" , id)
  }
}