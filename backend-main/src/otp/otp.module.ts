import { Module } from "@nestjs/common";
import { OtpService } from "./otp.service";
import { OtpController } from "./otp.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { UserModule } from "../user/user.module";

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [OtpController],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
