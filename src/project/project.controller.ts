/**
 * here any id is uuid 
 * get the project of this user
 * make endpoint  the super_admion can make inactive for any project with the id and this project stop on work when the status  (   @Column({ default: true })
  is_active: boolean;)

* and here the cannot 

 */

import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req, Query, Patch, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ProjectService } from './project.service';
import { AuthGuard } from '../auth/auth.guard';
import { Project } from 'entities/project.entity';
import { CreateProjectDto, UpdateProjectDto } from 'dto/project.dto';
import { UUID } from 'crypto';
import { CRUD } from 'common/crud.service';

@Controller('projects')
@UseGuards(AuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get('')
  async findAllProjects(@Req() req: any, @Query() query: any) {
    if (req.user.role?.name !== 'super_admin') {
      throw new ForbiddenException('Only super admin can inactivate projects');
    }
    return CRUD.findAll(this.projectService.projectRepo, 'project', query.search, query.page, query.limit, query.sortBy, query.sortOrder, ['branches', 'products', 'owner'], ['name'], query.filters);
  }

  @Get(':projectId/teams')
  async getTeamsByProject(@Param('projectId') projectId: string) {
    return this.projectService.findTeamsByProject(projectId);
  }

  @Get('my-project')
  async find(@Req() req: any) {
    return this.projectService.find(req?.user);
  }

  @Get('my-info')
  async findInfo(@Req() req: any) {
    return this.projectService.findInfo(req?.user);
  }

  @Put('')
  async update(@Body() dto: UpdateProjectDto, @Req() req: any) {
    return this.projectService.put(dto, req.user.id);
  }

  @Delete(':id')
  async delete(@Param('id') id: UUID, @Req() req: any) {
    if (req.user.role?.name !== 'super_admin') {
      throw new ForbiddenException('Only super admin can inactivate projects');
    }
    return CRUD.softDelete(this.projectService.projectRepo, 'project', id);
  }

  @Patch(':id/inactivate')
  async inactivateProject(@Param('id') id: UUID, @Req() req: any) {
    if (req.user.role?.name !== 'super_admin') {
      throw new ForbiddenException('Only super admin can inactivate projects');
    }

    return this.projectService.inactivate(id);
  }
}
