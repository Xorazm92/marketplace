import { Module } from '@nestjs/common';
import { AuthTokenService } from './auth-token.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PhoneAuthController } from './phone-auth.controller';
import { PhoneAuthService } from './phone-auth.service';
import { SmsService } from '../common/services/sms.service';
import { JwtModule } from '@nestjs/jwt';
import { AdminModule } from '../admin/admin.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { UserAuthService } from '../user-auth/user-auth.service';
import { UserModule } from '../user/user.module';
import { OtpModule } from '../otp/otp.module';

@Module({
  imports:[
    JwtModule.register({ global: true }),
    PrismaModule,
    AdminModule,
    MailModule,
    UserModule,
    OtpModule
  ],
  controllers: [AuthController, PhoneAuthController],
  providers: [AuthService, PhoneAuthService, SmsService, AuthTokenService, UserAuthService],
  exports: [PhoneAuthService, SmsService, AuthTokenService, UserAuthService],
})
export class AuthModule {}
