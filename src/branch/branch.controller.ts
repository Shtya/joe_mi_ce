/**
 * here the branch related to branch and i can assign the supervisor on this branch and the pormoter (optional)
 * make endpoint to add supervisor to brancn and ensure this branch doen't have supervisor becuase the branch have one supervisor
 * and endpoint to add pormoter on branch and ensure this user that i will add it not exist in any branch to dont' make dublicate to any thing
 *
 * and when any one edit on any thing here check if this user in this project or no
 * and i i missgin anything important add it as logic
 * and handle the dto for this also
 *
 *
 * endpoint to get branches on project and have every details
 */
import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request, Query, Req, ForbiddenException } from '@nestjs/common';
import { BranchService } from './branch.service';
import { CreateBranchDto, UpdateBranchDto, AssignPromoterDto } from 'dto/branch.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { PaginationQueryDto } from 'dto/pagination.dto';
import { CRUD } from 'common/crud.service';
import { UUID } from 'crypto';
import { ERole } from 'enums/Role.enum';
import { Permissions } from 'decorators/permissions.decorators';
import { EPermission } from 'enums/Permissions.enum';

@Controller('branches')
@UseGuards(AuthGuard)
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  @Permissions(EPermission.BRANCH_CREATE)
  create(@Request() req, @Body() dto: CreateBranchDto) {
    return this.branchService.create(dto, req.user);
  }

  @Get(':projectId/project')
  @Permissions(EPermission.BRANCH_READ)
  async getBranchesByProject(@Param('projectId') projectId: string, @Query() query: PaginationQueryDto) {
    return CRUD.findAll(this.branchService.branchRepo, 'branch', query.search, query.page, query.limit, query.sortBy, query.sortOrder, ['city', 'chain', 'project', 'supervisor', 'team'], ['name'], { project: { id: projectId } });
  }

  @Get('/my')
  @Permissions(EPermission.BRANCH_READ)
  async getBranches(@Query() query: PaginationQueryDto, @Req() req: any) {
    if (req.user.role?.name == ERole.SUPER_ADMIN) {
      throw new ForbiddenException('You cannot access this route');
    }
    return CRUD.findAll(this.branchService.branchRepo, 'branch', query.search, query.page, query.limit, query.sortBy, query.sortOrder, ['city', 'chain', 'project', 'supervisor', 'team'], ['name'], { project: { id: req.user.project.id } });
  }

  @Get(':branchId/teams')
  @Permissions(EPermission.BRANCH_READ)
  async getTeamOnBranch(@Param('branchId') branchId: number, @Query() query: PaginationQueryDto, @Req() req: any) {
    return CRUD.findAll(this.branchService.branchRepo, 'branch', query.search, query.page, query.limit, query.sortBy, query.sortOrder, ['supervisor', 'team'], ['name'], { id: branchId });
  }

  @Get(':id')
  @Permissions(EPermission.BRANCH_READ)
  findOne(@Param('id') id: number) {
    return this.branchService.findOne(id);
  }

  @Put(':id')
  @Permissions(EPermission.BRANCH_UPDATE)
  update(@Param('id') id: number, @Request() req, @Body() dto: UpdateBranchDto) {
    return this.branchService.update(id, dto, req.user);
  }

  @Post(':id/supervisor')
  @Permissions(EPermission.BRANCH_ASSIGN_SUPERVISOR)
  assignSupervisor(@Param('id') id: number, @Body() dto, @Request() req) {
    return this.branchService.assignSupervisor(id, dto.userId, req.user);
  }

  @Post(':branchId/promoter')
  @Permissions(EPermission.BRANCH_ASSIGN_PROMOTER)
  async assignPromoter(@Param('projectId') projectId: any, @Param('branchId') branchId: any, @Body() dto: AssignPromoterDto, @Req() req: any) {
    return this.branchService.assignPromoter(req?.user?.project?.id, branchId, dto, req.user);
  }
}
