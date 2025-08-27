import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PhoneAuthController } from './phone-auth.controller';
import { PhoneAuthService } from './phone-auth.service';
import { SmsService } from '../common/services/sms.service';
import { RBACService } from './rbac/rbac.service';
import { AdminPermissionGuard } from './guards/admin-permission.guard';
import { JwtModule } from '@nestjs/jwt';
import { AdminModule } from '../admin/admin.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports:[
    JwtModule.register({ global: true }),
    PrismaModule,
    forwardRef(() => AdminModule),
    MailModule
  ],
  controllers: [AuthController, PhoneAuthController],
  providers: [AuthService, PhoneAuthService, SmsService, RBACService, AdminPermissionGuard],
  exports: [PhoneAuthService, SmsService, RBACService, AdminPermissionGuard],
})
export class AuthModule {}
