import { IsString, IsNotEmpty, IsOptional, IsArray, IsNumber } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  permissionIds?: number[];
}

export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  permissionIds?: number[];
}

export class AddPermissionsDto {
  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  permissionIds: number[];
}

export class RemovePermissionsDto {
  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  permissionIds: number[];
}

export class RoleResponseDto {
  id: number;
  name: string;
  description?: string;
  permissions?: PermissionDto[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class PermissionDto {
  id: number;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class RoleListResponseDto {
  data: RoleResponseDto[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}
