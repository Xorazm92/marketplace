
import { Controller, Get, Post, Put, Delete, Param, Query, UseGuards, Body, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminPhoneAuthService } from './admin-phone-auth.service';
import { AdminGuard } from '../guards/admin.guard';
import { AdminPermissionGuard, Permissions } from '../auth/guards/admin-permission.guard';
import { Permission } from '../auth/rbac/permissions.enum';
import { AdminPhoneSignUpDto, AdminPhoneSignInDto, AdminOtpLoginDto } from './dto';
import { Response } from 'express';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly adminPhoneAuthService: AdminPhoneAuthService
  ) {}

  // =============== AUTHENTICATION ENDPOINTS ===============

  @Post('auth/send-otp')
  @ApiOperation({ summary: 'Send OTP for admin registration or login' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  async sendAdminOtp(@Body() body: { phone_number: string; purpose?: 'registration' | 'login' }) {
    return this.adminPhoneAuthService.sendAdminOtp(body.phone_number, body.purpose);
  }

  @Post('auth/phone-signup')
  @ApiOperation({ summary: 'Admin registration via phone number' })
  @ApiResponse({ status: 201, description: 'Admin registered successfully' })
  async adminPhoneSignUp(@Body() dto: AdminPhoneSignUpDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.adminPhoneAuthService.adminPhoneSignUp(dto);

    // Refresh token'ni cookie'ga saqlash
    res.cookie('admin_refresh_token', result.refresh_token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 kun
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return {
      message: result.message,
      admin: result.admin,
      access_token: result.access_token,
      token_type: result.token_type,
    };
  }

  @Post('auth/phone-signin')
  @ApiOperation({ summary: 'Admin login via phone number and password' })
  @ApiResponse({ status: 200, description: 'Admin logged in successfully' })
  async adminPhoneSignIn(@Body() dto: AdminPhoneSignInDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.adminPhoneAuthService.adminPhoneSignIn(dto);

    // Refresh token'ni cookie'ga saqlash
    res.cookie('admin_refresh_token', result.refresh_token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 kun
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return {
      message: result.message,
      admin: result.admin,
      access_token: result.access_token,
      token_type: result.token_type,
    };
  }

  @Post('auth/otp-login')
  @ApiOperation({ summary: 'Admin login via OTP' })
  @ApiResponse({ status: 200, description: 'Admin logged in successfully' })
  async adminOtpLogin(@Body() dto: AdminOtpLoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.adminPhoneAuthService.adminOtpLogin(dto);

    // Refresh token'ni cookie'ga saqlash
    res.cookie('admin_refresh_token', result.refresh_token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 kun
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return {
      message: result.message,
      admin: result.admin,
      access_token: result.access_token,
      token_type: result.token_type,
    };
  }

  @Post('auth/logout')
  @ApiOperation({ summary: 'Admin logout' })
  @ApiResponse({ status: 200, description: 'Admin logged out successfully' })
  @UseGuards(AdminGuard)
  @ApiBearerAuth('inbola')
  async adminLogout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('admin_refresh_token');
    return { message: 'Admin muvaffaqiyatli tizimdan chiqdi' };
  }

  // =============== PROTECTED ADMIN ENDPOINTS ===============

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @UseGuards(AdminPermissionGuard)
  @Permissions([Permission.VIEW_DASHBOARD])
  @ApiBearerAuth('inbola')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get users with pagination' })
  @UseGuards(AdminPermissionGuard)
  @Permissions([Permission.VIEW_USERS])
  @ApiBearerAuth('inbola')
  async getUserManagement(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    return this.adminService.getUserManagement(+page, +limit);
  }

  @Get('products')
  @ApiOperation({ summary: 'Get products with pagination and status filter' })
  @UseGuards(AdminPermissionGuard)
  @Permissions([Permission.VIEW_PRODUCTS])
  @ApiBearerAuth('inbola')
  async getProductManagement(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string
  ) {
    return this.adminService.getProductManagement(+page, +limit, status);
  }

  @Put('products/:id/approve')
  @ApiOperation({ summary: 'Approve product' })
  @UseGuards(AdminPermissionGuard)
  @Permissions([Permission.APPROVE_PRODUCT])
  @ApiBearerAuth('inbola')
  async approveProduct(@Param('id') id: string) {
    return this.adminService.approveProduct(+id);
  }

  @Put('products/:id/reject')
  @ApiOperation({ summary: 'Reject product' })
  @UseGuards(AdminPermissionGuard)
  @Permissions([Permission.REJECT_PRODUCT])
  @ApiBearerAuth('inbola')
  async rejectProduct(@Param('id') id: string, @Body() body: { reason?: string }) {
    return this.adminService.rejectProduct(+id, body.reason);
  }
}
