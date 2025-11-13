/**
 * i need here endpoint to get all users created By the owner :id owner
 * and get all users for the super_admin to see the all accounts
 *
 * i can assign the supervisor or the poromoter when create it to branch in the register ( optional to add the supervisor or the pormoter)
 * 
 * when upldate or add user form the admin you should check when branch_id is this branch exist in hist project the admin or now 
 */

/**
 * when add supervisor check if this user exist in any where or no
 * when add teams check if this id of the user is exist in any where or no
 */

import { Controller, Post, Body, UseGuards, Get, Param, Req, ForbiddenException, Put, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { RegisterDto, LoginDto, RefreshTokenDto, ViewUserPasswordDto, UpdateUserDto, UpdateUserRoleDto } from 'dto/user.dto';
import { User } from 'entities/user.entity';
import { ERole } from 'enums/Role.enum';
import { Permissions } from 'decorators/permissions.decorators';
import { EPermission } from 'enums/Permissions.enum';

@Controller('')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard)
  @Post('auth/register')
  async register(@Req() req:any , @Body() dto: RegisterDto) {
    if (!req.user && dto.role !== ERole.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admin can be created this way');
    }
    return this.authService.register(req.user, dto);
  }



  @Post('auth/login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }



  @UseGuards(AuthGuard)
  @Post('auth/refresh-token')
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refresh_token);
  }



  @UseGuards(AuthGuard)
  @Get('users/me')
  async getCurrentUser(@Req() req: { user: User }) {
    return this.authService.getCurrentUser(req.user);
  }


  @UseGuards(AuthGuard)
  @Get('users/:id')
	@Permissions(EPermission.USER_READ)
  async getUserById( @Param("id") userId : number) {
    return this.authService.getUserById(userId);
  }



  @UseGuards(AuthGuard)
  @Get('users')
	@Permissions(EPermission.USER_READ)
  async getUsers(@Req() req: { user: User }) {
    return this.authService.getUsersCreatedByOrAll(req.user);
  }



  @UseGuards(AuthGuard)
  @Put('users/:id')
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto, @Req() req: any) {
    return this.authService.updateUser(id, dto, req.user);
  }



  @UseGuards(AuthGuard)
  @Delete('users/:id')
  async deleteUser(@Param('id') id: string, @Req() req: any) {
    return this.authService.deleteUser(id, req.user);
  }



  @UseGuards(AuthGuard)
  @Put('users/:id/role')
  async updateUserRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto, @Req() req: any) {
    return this.authService.updateUserRole(id, dto.role_id, req.user);
  }
}
