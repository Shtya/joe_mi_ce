export enum EPermission {
  // User Management
  USER_CREATE = 'user.create',
  USER_READ = 'user.read',
  USER_UPDATE = 'user.update',
  USER_DELETE = 'user.delete',
  USER_MANAGE = 'user.manage',

  // Role Management
  ROLE_CREATE = 'role.create',
  ROLE_READ = 'role.read',
  ROLE_UPDATE = 'role.update',
  ROLE_DELETE = 'role.delete',
  ROLE_MANAGE = 'role.manage',

  // Permission Management
  PERMISSION_READ = 'permission.read',
  PERMISSION_ASSIGN = 'permission.assign',
  PERMISSION_CREATE="",
  PERMISSION_UPDATE="",
  PERMISSION_DELETE="",

  // Content Management
  CONTENT_MANAGE = 'content.manage',
  
  // System Administration
  SYSTEM_ADMIN = 'system.admin'
}