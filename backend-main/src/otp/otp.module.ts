import { Module, forwardRef } from "@nestjs/common";
import { OtpService } from "./otp.service";
import { OtpController } from "./otp.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { UserModule } from "../user/user.module";
import { UserAuthModule } from "../user-auth/user-auth.module";

@Module({
  imports: [PrismaModule, UserModule, forwardRef(() => UserAuthModule)],
  controllers: [OtpController],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
