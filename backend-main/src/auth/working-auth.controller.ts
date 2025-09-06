import { Controller, Get, Post, Body, Req, Res, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response, Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UnifiedAuthService } from './unified-auth.service';
import { TelegramAuthService } from './telegram-auth.service';

@ApiTags('🔐 Working Authentication')
@Controller('working-auth')
export class WorkingAuthController {
  constructor(
    private readonly unifiedAuthService: UnifiedAuthService,
    private readonly telegramAuthService: TelegramAuthService,
  ) {}

  // ==================== GOOGLE OAUTH ====================
  
  @Get('google/test')
  @ApiOperation({ summary: 'Test Google OAuth configuration' })
  googleTest() {
    return {
      success: true,
      message: 'Google OAuth test endpoint is working!',
      config: {
        clientId: process.env.GOOGLE_CLIENT_ID ? 'CONFIGURED' : 'MISSING',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'CONFIGURED' : 'MISSING',
        callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'NOT_SET',
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('google/login')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  async googleLogin(@Query('callbackUrl') callbackUrl?: string) {
    // This will redirect to Google OAuth
    return { message: 'Redirecting to Google OAuth...' };
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const googleUser = req.user as any;
      
      const result = await this.unifiedAuthService.googleLogin({
        providerId: googleUser.providerId,
        email: googleUser.email,
        firstName: googleUser.name?.split(' ')[0] || 'User',
        lastName: googleUser.name?.split(' ').slice(1).join(' ') || '',
        profileImg: googleUser.photo,
      });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/auth/callback?token=${result.accessToken}&refresh=${result.refreshToken}`;
      
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google auth error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/auth/error?message=Authentication failed`);
    }
  }

  // ==================== TELEGRAM AUTH ====================

  @Get('telegram/bot-info')
  @ApiOperation({ summary: 'Get Telegram bot information' })
  async getTelegramBotInfo() {
    try {
      const botInfo = await this.telegramAuthService.getBotUsername();
      return {
        success: true,
        ...botInfo,
        botToken: process.env.TELEGRAM_BOT_TOKEN ? 'CONFIGURED' : 'MISSING',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        botToken: process.env.TELEGRAM_BOT_TOKEN ? 'CONFIGURED' : 'MISSING',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post('telegram/login')
  @ApiOperation({ summary: 'Authenticate with Telegram' })
  @ApiResponse({ status: 200, description: 'Successfully authenticated' })
  @ApiResponse({ status: 401, description: 'Authentication failed' })
  async telegramLogin(@Body() telegramData: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    auth_date: number;
    hash: string;
  }) {
    try {
      const result = await this.telegramAuthService.authenticate(telegramData);
      return {
        success: true,
        message: 'Telegram authentication successful',
        token: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // ==================== SMS AUTH ====================

  @Post('sms/login')
  @ApiOperation({ summary: 'Authenticate with SMS code' })
  async smsLogin(@Body() smsData: { phoneNumber: string; code: string }) {
    try {
      const result = await this.unifiedAuthService.smsLogin(smsData.phoneNumber, smsData.code);
      return {
        success: true,
        message: 'SMS authentication successful',
        ...result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // ==================== GENERAL AUTH ====================

  @Get('providers')
  @ApiOperation({ summary: 'Get available authentication providers' })
  getAuthProviders() {
    return {
      success: true,
      providers: [
        {
          name: 'google',
          enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
          loginUrl: '/working-auth/google/login',
          testUrl: '/working-auth/google/test',
        },
        {
          name: 'telegram',
          enabled: !!process.env.TELEGRAM_BOT_TOKEN,
          loginUrl: '/working-auth/telegram/login',
          infoUrl: '/working-auth/telegram/bot-info',
        },
        {
          name: 'sms',
          enabled: !!process.env.SMS_TOKEN,
          loginUrl: '/working-auth/sms/login',
        },
      ],
      timestamp: new Date().toISOString(),
    };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh authentication tokens' })
  async refreshTokens(@Body() refreshData: { userId: number; refreshToken: string }) {
    try {
      const result = await this.unifiedAuthService.refreshTokens(
        refreshData.userId,
        refreshData.refreshToken
      );
      return {
        success: true,
        ...result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  async logout(@Body() logoutData: { userId: number }) {
    try {
      await this.unifiedAuthService.logout(logoutData.userId);
      return {
        success: true,
        message: 'Successfully logged out',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
