import { Module, forwardRef } from "@nestjs/common";
import { UserAuthService } from "./user-auth.service";
import { UserAuthController } from "./user-auth.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { UserModule } from "../user/user.module";
import { OtpModule } from "../otp/otp.module";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { GoogleStrategy } from "../auth/strategies/google.strategy";

@Module({
  imports: [
    PrismaModule,
    UserModule,
    forwardRef(() => OtpModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET') || 'default-secret',
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
    PassportModule.register({ defaultStrategy: 'google' }),
    ConfigModule,
  ],
  controllers: [UserAuthController],
  providers: [UserAuthService, GoogleStrategy],
  exports: [UserAuthService, JwtModule],
})
export class UserAuthModule {}
