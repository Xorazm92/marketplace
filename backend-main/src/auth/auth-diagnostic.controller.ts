import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('🔧 Auth Diagnostic')
@Controller('auth-diagnostic')
export class AuthDiagnosticController {
  
  @Get('test')
  @ApiOperation({ summary: 'Test auth diagnostic endpoint' })
  test() {
    return {
      success: true,
      message: 'Auth diagnostic controller is working',
      timestamp: new Date().toISOString(),
      endpoints: [
        'GET /auth-diagnostic/test',
        'GET /auth-diagnostic/config',
        'POST /auth-diagnostic/telegram-test',
        'GET /auth-diagnostic/google-test'
      ]
    };
  }

  @Get('config')
  @ApiOperation({ summary: 'Check auth configuration' })
  checkConfig() {
    return {
      success: true,
      config: {
        googleClientId: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT_SET',
        googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT_SET',
        googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || 'NOT_SET',
        telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ? 'SET' : 'NOT_SET',
        jwtAccessSecret: process.env.JWT_ACCESS_SECRET ? 'SET' : 'NOT_SET',
        jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ? 'SET' : 'NOT_SET',
      },
      timestamp: new Date().toISOString()
    };
  }

  @Post('telegram-test')
  @ApiOperation({ summary: 'Test Telegram auth data structure' })
  testTelegramAuth(@Body() data: any) {
    return {
      success: true,
      message: 'Telegram auth test endpoint working',
      receivedData: data,
      expectedFormat: {
        id: 'number',
        first_name: 'string',
        last_name: 'string (optional)',
        username: 'string (optional)',
        photo_url: 'string (optional)',
        auth_date: 'number',
        hash: 'string'
      },
      timestamp: new Date().toISOString()
    };
  }

  @Get('google-test')
  @ApiOperation({ summary: 'Test Google OAuth configuration' })
  testGoogleAuth() {
    return {
      success: true,
      message: 'Google auth test endpoint working',
      googleOAuthUrl: process.env.GOOGLE_CALLBACK_URL ? 
        `OAuth callback configured: ${process.env.GOOGLE_CALLBACK_URL}` : 
        'Google OAuth not configured',
      timestamp: new Date().toISOString()
    };
  }
}
