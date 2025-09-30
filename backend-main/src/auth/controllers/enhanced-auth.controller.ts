// @ts-nocheck
import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Req,
  Res,
  UseGuards,
  Query,
  Param,
  Ip,
  Headers,
} from '@nestjs/common';
import { Response } from 'express';
import { EnhancedAuthService } from '../enhanced-auth.service';
import { EnhancedRbacService } from '../rbac/enhanced-rbac.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RateLimitGuard } from '../guards/rate-limit.guard';
import { SecurityHeadersGuard } from '../guards/security-headers.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { 
  LoginDto, 
  RegisterDto, 
  TwoFactorSetupDto, 
  TwoFactorVerifyDto,
  OAuthCallbackDto,
  RefreshTokenDto,
  ChangePasswordDto,
  ResetPasswordDto,
} from '../dto/auth.dto';

@ApiTags('Enhanced Authentication')
@Controller('auth')
@UseGuards(SecurityHeadersGuard)
export class EnhancedAuthController {
  constructor(
    private readonly authService: EnhancedAuthService,
    private readonly rbacService: EnhancedRbacService,
  ) {}

  // ===========================================
  // AUTHENTICATION ENDPOINTS
  // ===========================================

  @Post('register')
  @UseGuards(RateLimitGuard)
  @ApiOperation({ summary: 'Register new user with enhanced security' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async register(
    @Body() registerDto: RegisterDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.register(registerDto, { ip, userAgent });
  }

  @Post('login')
  @UseGuards(RateLimitGuard)
  @ApiOperation({ summary: 'Login with enhanced security' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 423, description: 'Account locked' })
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const deviceInfo = { ip, userAgent };
    return this.authService.login(loginDto, deviceInfo, res);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and invalidate session' })
  async logout(
    @CurrentUser() user: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logout(user.id, res);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token with rotation' })
  async refreshToken(
    @Body() refreshDto: RefreshTokenDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const deviceInfo = { ip, userAgent };
    return this.authService.refreshToken(refreshDto.refreshToken, deviceInfo, res);
  }

  // ===========================================
  // TWO-FACTOR AUTHENTICATION
  // ===========================================

  @Post('2fa/setup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Setup 2FA for user' })
  async setupTwoFactor(@CurrentUser() user: any) {
    return this.authService.setupTwoFactor(user.id);
  }

  @Post('2fa/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify 2FA token' })
  async verifyTwoFactor(
    @CurrentUser() user: any,
    @Body() verifyDto: TwoFactorVerifyDto,
  ) {
    return this.authService.verifyTwoFactor(user.id, verifyDto.token);
  }

  @Post('2fa/disable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable 2FA' })
  async disableTwoFactor(
    @CurrentUser() user: any,
    @Body() verifyDto: TwoFactorVerifyDto,
  ) {
    return this.authService.disableTwoFactor(user.id, verifyDto.token);
  }

  // ===========================================
  // OAUTH ENDPOINTS
  // ===========================================

  @Get('oauth/:provider')
  @ApiOperation({ summary: 'Initiate OAuth flow' })
  async initiateOAuth(
    @Param('provider') provider: string,
    @Query('redirect_uri') redirectUri: string,
  ) {
    return this.authService.initiateOAuth(provider, redirectUri);
  }

  @Post('oauth/:provider/callback')
  @ApiOperation({ summary: 'Handle OAuth callback' })
  async oauthCallback(
    @Param('provider') provider: string,
    @Body() callbackDto: OAuthCallbackDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const deviceInfo = { ip, userAgent };
    return this.authService.handleOAuthCallback(provider, callbackDto, deviceInfo, res);
  }

  // ===========================================
  // PASSWORD MANAGEMENT
  // ===========================================

  @Post('password/change')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password' })
  async changePassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.id, changePasswordDto);
  }

  @Post('password/reset/request')
  @UseGuards(RateLimitGuard)
  @ApiOperation({ summary: 'Request password reset' })
  async requestPasswordReset(
    @Body('email') email: string,
    @Ip() ip: string,
  ) {
    return this.authService.requestPasswordReset(email, ip);
  }

  @Post('password/reset/confirm')
  @ApiOperation({ summary: 'Confirm password reset' })
  async confirmPasswordReset(
    @Body() resetDto: ResetPasswordDto,
  ) {
    return this.authService.confirmPasswordReset(resetDto);
  }

  // ===========================================
  // SESSION MANAGEMENT
  // ===========================================

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get active sessions' })
  async getSessions(@CurrentUser() user: any) {
    return this.authService.getActiveSessions(user.id);
  }

  @Delete('sessions/:sessionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Terminate specific session' })
  async terminateSession(
    @CurrentUser() user: any,
    @Param('sessionId') sessionId: string,
  ) {
    return this.authService.terminateSession(user.id, sessionId);
  }

  @Delete('sessions/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Terminate all sessions except current' })
  async terminateAllSessions(@CurrentUser() user: any) {
    return this.authService.terminateAllOtherSessions(user.id);
  }

  // ===========================================
  // RBAC ENDPOINTS
  // ===========================================

  @Get('permissions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user permissions' })
  async getPermissions(@CurrentUser() user: any) {
    return this.rbacService.getUserRoles(user.id);
  }

  @Post('check-permission')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check specific permission' })
  async checkPermission(
    @CurrentUser() user: any,
    @Body() body: { resource: string; action: string; context?: any },
  ) {
    const hasPermission = await this.rbacService.checkPermission({
      userId: user.id,
      resource: body.resource,
      action: body.action,
      context: body.context,
    });

    await this.rbacService.logPermissionCheck(
      user.id,
      body.action,
      body.resource,
      hasPermission,
      body.context,
    );

    return { hasPermission };
  }

  // ===========================================
  // SECURITY ENDPOINTS
  // ===========================================

  @Get('security/audit-log')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get security audit log' })
  async getAuditLog(
    @CurrentUser() user: any,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0,
  ) {
    return this.authService.getAuditLog(user.id, limit, offset);
  }

  @Post('security/alert')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Report suspicious activity' })
  async reportSuspiciousActivity(
    @CurrentUser() user: any,
    @Body() body: { description: string; metadata?: any },
  ) {
    return this.authService.reportSuspiciousActivity(user.id, body);
  }

  @Get('security/settings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get security settings' })
  async getSecuritySettings(@CurrentUser() user: any) {
    return this.authService.getSecuritySettings(user.id);
  }

  @Put('security/settings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update security settings' })
  async updateSecuritySettings(
    @CurrentUser() user: any,
    @Body() settings: any,
  ) {
    return this.authService.updateSecuritySettings(user.id, settings);
  }

  // ===========================================
  // ADMIN ENDPOINTS
  // ===========================================

  @Get('admin/users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get users with security info (Admin only)' })
  async getUsersWithSecurityInfo(
    @CurrentUser() user: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const hasPermission = await this.rbacService.checkPermission({
      userId: user.id,
      resource: 'users',
      action: 'read',
    });

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return this.authService.getUsersWithSecurityInfo(page, limit);
  }

  @Post('admin/lock-account')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lock user account (Admin only)' })
  async lockAccount(
    @CurrentUser() user: any,
    @Body() body: { userId: string; reason: string; duration?: number },
  ) {
    const hasPermission = await this.rbacService.checkPermission({
      userId: user.id,
      resource: 'users',
      action: 'update',
    });

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return this.authService.lockAccount(body.userId, body.reason, body.duration);
  }

  @Post('admin/unlock-account')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlock user account (Admin only)' })
  async unlockAccount(
    @CurrentUser() user: any,
    @Body() body: { userId: string; reason: string },
  ) {
    const hasPermission = await this.rbacService.checkPermission({
      userId: user.id,
      resource: 'users',
      action: 'update',
    });

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return this.authService.unlockAccount(body.userId, body.reason);
  }
}
