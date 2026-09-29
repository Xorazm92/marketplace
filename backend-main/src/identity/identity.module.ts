import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { OtpService } from './otp.service';
import { SmsService } from './sms.service';
import { UserAuthService } from './user-auth.service';
import { AdminAuthService } from './admin-auth.service';
import { AdminAccountsController, AdminAuthController, UserAuthController } from './identity.controllers';

// Global: UserGuard/AdminGuard har bir modulda TokenService ga tayanadi.
@Global()
@Module({
  // Secret har chaqiruvda ConfigService dan beriladi (TokenService), bu yerda emas.
  imports: [JwtModule.register({})],
  controllers: [UserAuthController, AdminAuthController, AdminAccountsController],
  providers: [TokenService, OtpService, SmsService, UserAuthService, AdminAuthService],
  exports: [TokenService, SmsService],
})
export class IdentityModule {}
