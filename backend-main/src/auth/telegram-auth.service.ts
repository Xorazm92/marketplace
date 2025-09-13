import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { UnifiedAuthService, AuthProvider } from './unified-auth.service';

export interface TelegramUserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

@Injectable()
export class TelegramAuthService {
  private readonly logger = new Logger(TelegramAuthService.name);
  private readonly botToken: string;
  private readonly authDataExpiration: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly unifiedAuthService: UnifiedAuthService,
  ) {
    this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    this.authDataExpiration = this.configService.get<number>('TELEGRAM_AUTH_EXPIRATION', 86400); // 24 hours by default
    
    if (!this.botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN is not configured');
    }
  }

  // Verify Telegram authentication data
  private verifyTelegramData(data: TelegramUserData): boolean {
    try {
      const { hash, ...dataToCheck } = data;
      const secretKey = crypto.createHash('sha256').update(this.botToken).digest();
      
      // Create data check string
      const dataCheckString = Object.entries(dataToCheck)
        .filter(([key]) => key !== 'hash')
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
      
      // Calculate hash
      const hmac = crypto.createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');
      
      // Compare hashes
      return hmac === hash;
    } catch (error) {
      this.logger.error('Error verifying Telegram data', error);
      return false;
    }
  }

  // Check if auth data is not expired
  private isAuthDataExpired(authDate: number): boolean {
    const authDateTime = authDate * 1000; // Convert to milliseconds
    const now = Date.now();
    return (now - authDateTime) > (this.authDataExpiration * 1000);
  }

  // Authenticate user with Telegram data
  async authenticate(data: TelegramUserData) {
    // Verify data integrity
    if (!this.verifyTelegramData(data)) {
      throw new UnauthorizedException('Invalid Telegram authentication data');
    }

    // Check if auth data is not expired
    if (this.isAuthDataExpired(data.auth_date)) {
      throw new UnauthorizedException('Authentication data has expired');
    }

    try {
      // Find or create user
      const user = await this.unifiedAuthService.findOrCreateUser('telegram', {
        providerId: data.id.toString(),
        firstName: data.first_name,
        lastName: data.last_name || '',
        email: data.username ? `${data.username}@telegram` : undefined,
        profileImg: data.photo_url,
      });

      // Generate JWT tokens
      const tokens = await this.unifiedAuthService.generateTokens({
        id: user.id,
        phoneNumber: user.phone_number,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        isVerified: user.is_verified,
        authProvider: 'telegram',
      });

      // Update refresh token
      await this.unifiedAuthService.updateRefreshToken(user.id, tokens.refreshToken);

      return {
        ...tokens,
        user: {
          id: user.id,
          phoneNumber: user.phone_number,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          isVerified: user.is_verified,
        },
      };
    } catch (error) {
      this.logger.error('Error in Telegram authentication', error);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  // Get bot username for frontend
  async getBotUsername(): Promise<{ username: string }> {
    // In a real implementation, you might want to cache this
    return { username: this.configService.get<string>('TELEGRAM_BOT_USERNAME', 'your_bot_username') };
  }
}
