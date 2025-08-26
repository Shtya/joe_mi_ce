import { Controller, Post, Body, Param, Put, Get, UseGuards, Query, Delete } from '@nestjs/common';
import { VacationService } from './vacation.service';
import { CreateVacationDto, UpdateVacationDto } from 'dto/vacation.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UUID } from 'crypto';
import { CRUD } from 'common/crud.service';

@UseGuards(AuthGuard)
@Controller('vacations')
export class VacationController {
  constructor(private readonly vacationService: VacationService) {}

  // Create a new vacation request
  @Post()
  async createVacation(@Body() dto: CreateVacationDto) {
    return await this.vacationService.createVacation(dto);
  }

  // Get all vacations for a user
  @Get('by-branch/:branchId')
  async getVacationsByBranch(@Param('branchId') branchId: UUID, @Query() query) {
    return CRUD.findAll(this.vacationService.vacationRepo, 'vacation', query.search, query.page, query.limit, query.sortBy, query.sortOrder, ['branch'], [], { branch: { id: branchId } });
  }

  @Get('by-user/:userId')
  async getVacationsByUser(@Param('userId') userId: UUID, @Query() query) {
    return CRUD.findAll(this.vacationService.vacationRepo, 'vacation', query.search, query.page, query.limit, query.sortBy, query.sortOrder, ['user'], [], { user: { id: userId } });
  }

  // Supervisor can approve or reject vacation
  @Put(':id')
  async updateVacationStatus(@Param('id') id: string, @Body() dto: UpdateVacationDto) {
    return await this.vacationService.updateVacationStatus(id, dto);
  }

     @Delete(':id')
    async deleteVacation(@Param('id') id: string) {
      return CRUD.softDelete(this.vacationService.vacationRepo, 'vacation', id )
    }
}
