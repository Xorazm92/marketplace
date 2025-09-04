import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus, 
  UseGuards, 
  Req, 
  Res, 
  Get, 
  Query,
  UnauthorizedException,
  BadRequestException
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UnifiedAuthService, AuthProvider } from './unified-auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

export class SmsLoginDto {
  phoneNumber: string;
  code: string;
}

export class GoogleLoginDto {
  accessToken: string;
  firstName: string;
  lastName: string;
  email: string;
  photoUrl?: string;
}

export class TelegramLoginDto {
  id: string;
  username?: string;
  firstName: string;
  lastName?: string;
  photoUrl?: string;
  authDate: number;
  hash: string;
}

@Controller('auth')
export class UnifiedAuthController {
  constructor(
    private readonly authService: UnifiedAuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('sms/login')
  @HttpCode(HttpStatus.OK)
  async smsLogin(@Body() smsLoginDto: SmsLoginDto) {
    try {
      return await this.authService.smsLogin(
        smsLoginDto.phoneNumber,
        smsLoginDto.code
      );
    } catch (error) {
      throw new UnauthorizedException('SMS login failed');
    }
  }

  @Post('google/login')
  @HttpCode(HttpStatus.OK)
  async googleLogin(@Body() googleLoginDto: GoogleLoginDto) {
    try {
      // In a real app, validate the Google access token here
      // For now, we'll trust the client and use the provided data
      return await this.authService.googleLogin({
        providerId: googleLoginDto.accessToken, // In production, extract user ID from access token
        email: googleLoginDto.email,
        firstName: googleLoginDto.firstName,
        lastName: googleLoginDto.lastName,
        profileImg: googleLoginDto.photoUrl,
      });
    } catch (error) {
      console.error('Google login error:', error);
      throw new UnauthorizedException('Google login failed');
    }
  }

  @Post('telegram/login')
  @HttpCode(HttpStatus.OK)
  async telegramLogin(
    @Body() telegramLoginDto: TelegramLoginDto,
    @Req() req: Request,
  ) {
    try {
      // In a real app, validate the Telegram auth data here
      // This is a simplified version - you should verify the hash
      // See: https://core.telegram.org/widgets/login#checking-authorization
      
      return await this.authService.telegramLogin({
        id: telegramLoginDto.id,
        username: telegramLoginDto.username,
        firstName: telegramLoginDto.firstName,
        lastName: telegramLoginDto.lastName,
        photoUrl: telegramLoginDto.photoUrl,
      });
    } catch (error) {
      console.error('Telegram login error:', error);
      throw new UnauthorizedException('Telegram login failed');
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @Body('refreshToken') refreshToken: string,
    @Req() req: Request,
  ) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    try {
      const payload = this.authService['jwtService'].verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'your-refresh-secret'),
      });

      return await this.authService.refreshTokens(
        payload.sub,
        refreshToken,
      );
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: any) {
    await this.authService.logout(req.user.id);
    return { message: 'Logged out successfully' };
  }

  @Get('providers')
  getAuthProviders() {
    return {
      providers: ['sms', 'google', 'telegram'],
      google: {
        clientId: this.configService.get<string>('GOOGLE_CLIENT_ID'),
        callbackUrl: this.configService.get<string>('GOOGLE_CALLBACK_URL'),
      },
      telegram: {
        botUsername: this.configService.get<string>('TELEGRAM_BOT_USERNAME'),
      },
    };
  }
}
