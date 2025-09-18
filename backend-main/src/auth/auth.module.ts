import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PhoneAuthController } from './phone-auth.controller';
import { PhoneAuthService } from './phone-auth.service';
import { SmsService } from '../common/services/sms.service';
import { JwtModule } from '@nestjs/jwt';
import { AdminModule } from '../admin/admin.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { GoogleAuthController } from './controllers/google-auth.controller';
import { GoogleStrategy } from './strategies/google.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports:[
    PassportModule,
    JwtModule.register({ global: true }),
    PrismaModule,
    AdminModule,
    MailModule
  ],
  controllers: [AuthController, PhoneAuthController, GoogleAuthController],
  providers: [AuthService, PhoneAuthService, SmsService, GoogleStrategy],
  exports: [AuthService, PhoneAuthService, SmsService],
})
export class AuthModule {}
