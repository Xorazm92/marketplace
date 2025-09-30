// @ts-nocheck
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RbacService } from '../services/rbac.service';

@ApiTags('rbac')
@Controller('rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('roles')
  @ApiOperation({ summary: 'Get all roles' })
  async getRoles() {
    return this.rbacService.getRoles();
  }

  @Post('roles')
  @ApiOperation({ summary: 'Create new role' })
  async createRole(@Body() createRoleDto: any) {
    return this.rbacService.createRole(createRoleDto);
  }

  @Get('permissions')
  @ApiOperation({ summary: 'Get all permissions' })
  async getPermissions() {
    return this.rbacService.getPermissions();
  }

  @Post('kyc/submit')
  @ApiOperation({ summary: 'Submit KYC verification' })
  async submitKyc(@Request() req, @Body() kycData: any) {
    return this.rbacService.submitKycVerification(req.user.id, kycData);
  }

  @Get('kyc/status')
  @ApiOperation({ summary: 'Get KYC verification status' })
  async getKycStatus(@Request() req) {
    return { userId: req.user.id, status: 'pending' };
  }

  @Get('kyc/verifications')
  @ApiOperation({ summary: 'Get all KYC verifications' })
  async getKycVerifications(@Query('status') status?: string) {
    return [];
  }
}
