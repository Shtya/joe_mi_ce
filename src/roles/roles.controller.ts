import { Controller, Post, Get, Patch, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { RolesService } from './roles.service';
import { 
  CreateRoleDto, 
  UpdateRoleDto, 
  AddPermissionsDto, 
  RemovePermissionsDto,
  RoleResponseDto,
  RoleListResponseDto
} from 'dto/role.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { EPermission } from 'enums/Permissions.enum';
import { Permissions } from 'decorators/permissions.decorators';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  // @UseGuards(AuthGuard)
  // @Permissions(EPermission.ROLE_CREATE)
  async create(@Body() dto: CreateRoleDto){
    return this.rolesService.create(dto);
  }

  @Get()
  // @UseGuards(AuthGuard)
  // @Permissions(EPermission.ROLE_READ)
  async findAll(@Req() req: any, @Query() query ) {
     const { page, limit, search, sortBy, category, type, sortOrder } = query;
    return this.rolesService.findAll(
      'roles',
      search,
      page,
      limit,
      sortBy,
      sortOrder,
      [], // relations
      ['name'],// searchFields
      { }, // filter ( user: { id: req.user.id }, category, type  )
    );
  }
 
  @Patch(':id')
  // @UseGuards(AuthGuard)
  // @Permissions(EPermission.ROLE_UPDATE)
  async update(@Param('id') id: number, @Body() dto: UpdateRoleDto){
    return this.rolesService.update(id, dto);
  }

  @Post(':id/permissions')
  // @UseGuards(AuthGuard)
  // @Permissions(EPermission.ROLE_UPDATE)
  async addPermissions(
    @Param('id') roleId: number, 
    @Body() dto: AddPermissionsDto
  ){
    return this.rolesService.addPermissions(roleId, dto);
  }

  @Delete(':id/permissions')
  // @UseGuards(AuthGuard)
  // @Permissions(EPermission.ROLE_UPDATE)
  async removePermissions(
    @Param('id') roleId: number, 
    @Body() dto: RemovePermissionsDto
  ){
    return this.rolesService.removePermissions(roleId, dto);
  }

  @Delete(':id')
  // @UseGuards(AuthGuard)
  // @Permissions(EPermission.ROLE_DELETE)
  async delete(@Param('id') id: number)  {
    return this.rolesService.remove(id);
  }
}