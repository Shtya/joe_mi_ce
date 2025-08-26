import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { ShiftService } from './shift.service'; 
import { CreateShiftDto, UpdateShiftDto } from 'dto/shift.dto';
import { CRUD } from 'common/crud.service';

@Controller('shifts')
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  @Post()
  create(@Body() dto: CreateShiftDto) {
    return this.shiftService.create(dto);
  }

  @Get()
  findAll(@Query() query ) {
    return CRUD.findAll(this.shiftService.shiftRepo, 'shift', query.search, query.page, query.limit, query.sortBy, query.sortOrder, ["project"], ['name'], query.filters);
    
  }
 
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateShiftDto) {
    return this.shiftService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return CRUD.softDelete(this.shiftService.shiftRepo, 'shift', id )
  }

  @Get('/by-project/:projectId')
  findByProject(@Param('projectId') projectId: string , @Query() query ) {
        return CRUD.findAll(this.shiftService.shiftRepo, 'shift', query.search, query.page, query.limit, query.sortBy, query.sortOrder, ["project"], ['name'], {project : {id : projectId}});
    // return this.shiftService.findByProject(projectId);
  }
}
