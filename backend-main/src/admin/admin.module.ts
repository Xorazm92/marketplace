import { Module, forwardRef } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminPhoneAuthService } from './admin-phone-auth.service';
import { AdminController } from './admin.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { OtpModule } from '../otp/otp.module';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    OtpModule,
    forwardRef(() => AuthModule),
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_KEY || 'default-secret',
      signOptions: { expiresIn: '15m' }
    })
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminPhoneAuthService],
  exports: [AdminService, AdminPhoneAuthService]
})
export class AdminModule {}
