import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PhoneAuthController } from './phone-auth.controller';
import { UserAuthController } from './user-auth.controller';
import { GoogleAuthController } from './google-auth.controller';
import { TelegramAuthController } from './telegram-auth.controller';
import { PhoneAuthService } from './phone-auth.service';
import { UserAuthService } from './user-auth.service';
import { TelegramAuthService } from './telegram-auth.service';
import { UnifiedAuthService } from './unified-auth.service';
import { SmsService } from '../common/services/sms.service';
import { RBACService } from './rbac/rbac.service';
import { AdminPermissionGuard } from './guards/admin-permission.guard';
import { JwtModule } from '@nestjs/jwt';
import { AdminModule } from '../admin/admin.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'your-access-secret',
      signOptions: { expiresIn: '15m' },
    }),
    PassportModule,
    PrismaModule,
    forwardRef(() => AdminModule),
    MailModule,
  ],
  controllers: [
    AuthController, 
    PhoneAuthController,
    UserAuthController,
    GoogleAuthController,
    TelegramAuthController,
  ],
  providers: [
    AuthService, 
    PhoneAuthService,
    UserAuthService,
    TelegramAuthService,
    UnifiedAuthService,
    SmsService, 
    RBACService, 
    AdminPermissionGuard,
    JwtStrategy,
    GoogleStrategy,
  ],
  exports: [
    PhoneAuthService, 
    SmsService, 
    RBACService, 
    AdminPermissionGuard,
    UserAuthService,
  ],
})
export class AuthModule {}
