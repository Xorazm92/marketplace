import { IsString, IsNotEmpty, IsArray, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum RoleName {
  GUEST = 'guest',
  CUSTOMER = 'customer',
  SELLER = 'seller',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

export enum Permission {
  // Guest permissions
  VIEW_PRODUCTS = 'view_products',
  SEARCH_PRODUCTS = 'search_products',
  VIEW_CATEGORIES = 'view_categories',
  VIEW_REVIEWS = 'view_reviews',
  WISHLIST_LOCAL = 'wishlist_local',

  // Customer permissions
  PLACE_ORDER = 'place_order',
  MANAGE_PROFILE = 'manage_profile',
  WRITE_REVIEWS = 'write_reviews',
  VIEW_ORDERS = 'view_orders',
  CANCEL_ORDER = 'cancel_order',
  TRACK_ORDER = 'track_order',
  MANAGE_ADDRESS = 'manage_address',
  MANAGE_PAYMENT = 'manage_payment',

  // Seller permissions
  MANAGE_PRODUCTS = 'manage_products',
  VIEW_SALES = 'view_sales',
  MANAGE_INVENTORY = 'manage_inventory',
  VIEW_CUSTOMERS = 'view_customers',
  RESPOND_REVIEWS = 'respond_reviews',
  MANAGE_SHOP = 'manage_shop',
  VIEW_ANALYTICS = 'view_analytics',
  PROCESS_ORDERS = 'process_orders',

  // Moderator permissions
  MODERATE_PRODUCTS = 'moderate_products',
  MODERATE_REVIEWS = 'moderate_reviews',
  BLOCK_USERS = 'block_users',
  MANAGE_CONTENT = 'manage_content',
  VIEW_REPORTS = 'view_reports',

  // Admin permissions
  MANAGE_USERS = 'manage_users',
  MANAGE_ROLES = 'manage_roles',
  MANAGE_PERMISSIONS = 'manage_permissions',
  SYSTEM_CONFIG = 'system_config',
  VIEW_AUDIT_LOGS = 'view_audit_logs',
  MANAGE_CATEGORIES = 'manage_categories',
  MANAGE_SETTINGS = 'manage_settings',
  BACKUP_SYSTEM = 'backup_system',
}

export class CreateRoleDto {
  @ApiProperty({ example: 'customer', description: 'Role name' })
  @IsString()
  @IsNotEmpty()
  @IsEnum(RoleName)
  name: RoleName;

  @ApiProperty({ example: 'Regular customer role', description: 'Role description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: ['view_products', 'place_order'], description: 'List of permissions' })
  @IsArray()
  @IsString({ each: true })
  permissions: Permission[];

  @ApiProperty({ example: true, description: 'Whether role is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateRoleDto {
  @ApiProperty({ example: 'Updated customer role', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: ['view_products', 'place_order'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: Permission[];

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AssignRoleDto {
  @ApiProperty({ example: 'user123', description: 'User ID' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'customer', description: 'Role name' })
  @IsString()
  @IsNotEmpty()
  @IsEnum(RoleName)
  roleName: RoleName;
}

export class CheckPermissionDto {
  @ApiProperty({ example: 'view_products', description: 'Permission to check' })
  @IsString()
  @IsNotEmpty()
  permission: Permission;

  @ApiProperty({ example: 'user123', description: 'User ID (optional)' })
  @IsOptional()
  @IsString()
  userId?: string;
}

export class KycVerificationDto {
  @ApiProperty({ example: 'AA1234567', description: 'Passport series and number' })
  @IsString()
  @IsNotEmpty()
  passportNumber: string;

  @ApiProperty({ example: 'John', description: 'First name as in passport' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name as in passport' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '1990-01-01', description: 'Date of birth' })
  @IsString()
  @IsNotEmpty()
  dateOfBirth: string;

  @ApiProperty({ type: 'string', format: 'binary', description: 'Passport photo' })
  @IsNotEmpty()
  passportPhoto: any;

  @ApiProperty({ type: 'string', format: 'binary', description: 'Selfie with passport' })
  @IsNotEmpty()
  selfieWithPassport: any;

  @ApiProperty({ example: 'INN123456789', description: 'Tax identification number (for sellers)' })
  @IsOptional()
  @IsString()
  taxId?: string;

  @ApiProperty({ example: '12345678', description: 'Business registration number (for sellers)' })
  @IsOptional()
  @IsString()
  businessLicense?: string;

  @ApiProperty({ type: 'string', format: 'binary', description: 'Business license photo (for sellers)' })
  @IsOptional()
  businessLicensePhoto?: any;
}

export class BusinessVerificationDto {
  @ApiProperty({ example: 'INN123456789', description: 'Tax identification number' })
  @IsString()
  @IsNotEmpty()
  taxId: string;

  @ApiProperty({ example: '12345678', description: 'Business registration number' })
  @IsString()
  @IsNotEmpty()
  businessLicense: string;

  @ApiProperty({ example: 'INBOLA LLC', description: 'Company name' })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({ example: 'Tashkent', description: 'Company address' })
  @IsString()
  @IsNotEmpty()
  companyAddress: string;

  @ApiProperty({ type: 'string', format: 'binary', description: 'Business license photo' })
  @IsNotEmpty()
  businessLicensePhoto: any;

  @ApiProperty({ type: 'string', format: 'binary', description: 'Tax certificate photo' })
  @IsNotEmpty()
  taxCertificatePhoto: any;
}
