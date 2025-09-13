import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UnifiedAuthService } from './unified-auth.service';
import { UnifiedAuthController } from './unified-auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';
import { GoogleAuthController } from './google-auth.controller';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET', 'your-access-secret'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UnifiedAuthController, GoogleAuthController],
  providers: [UnifiedAuthService, JwtStrategy, GoogleStrategy, GoogleAuthGuard],
  exports: [UnifiedAuthService],
})
export class UnifiedAuthModule {}
