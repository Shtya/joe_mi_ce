import { Controller, Post, Get, Param, Put, Delete, Body, Query, UseGuards } from '@nestjs/common';
import { CompetitorService } from './competitor.service';
import { CreateCompetitorDto, UpdateCompetitorDto } from 'dto/competitors.dto';
import { CRUD } from 'common/crud.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { UUID } from 'crypto';


@UseGuards(AuthGuard)
@Controller('competitors')
export class CompetitorController {
  constructor(private readonly competitorService: CompetitorService) {}

  // Create a new competitor
  @Post()
  async createCompetitor(@Body() dto: CreateCompetitorDto) {
    return await this.competitorService.createCompetitor(dto);
  }

  // Get all competitors
  @Get()
  async getCompetitors( @Query() query) {
        return CRUD.findAll(this.competitorService.competitorRepo , 
          "competitors" , 
          query.search, 
          query.page, 
          query.limit, 
          query.sortBy, 
          query.sortOrder, 
          ['project' ], 
          ['name']
        );
  }

  @Get("by-project/:projectId")
  async getCompetitorsByProject(@Param("projectId") projectId : UUID , @Query() query) {
        return CRUD.findAll(this.competitorService.competitorRepo , 
          "competitors" , 
          query.search, 
          query.page, 
          query.limit, 
          query.sortBy, 
          query.sortOrder, 
          ['project' ], 
          ['name'],
          {project : {id : projectId}}
        );
  }

  // Get a specific competitor by ID
  @Get(':id')
  async getCompetitorById(@Param('id') id: string) {
    return await this.competitorService.getCompetitorById(id);
  }

  // Update a competitor by ID
  @Put(':id')
  async updateCompetitor(
    @Param('id') id: string,
    @Body() dto: UpdateCompetitorDto,
  ) {
    return await this.competitorService.updateCompetitor(id, dto);
  }

  // Delete a competitor by ID
  @Delete(':id')
  async deleteCompetitor(@Param('id') id: string) {
    return CRUD.softDelete(this.competitorService.competitorRepo , "competitors" , id )
  }
}
