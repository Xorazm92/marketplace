import { Module } from "@nestjs/common";
import { OtpService } from "./otp.service";
import { OtpController } from "./otp.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { UserModule } from "../user/user.module";
import { CommonModule } from "../common/common.module";

@Module({
  imports: [PrismaModule, UserModule, CommonModule],
  controllers: [OtpController],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
