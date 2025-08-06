import { Controller, Post, Body } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";

import { OtpService } from "./otp.service";
import { CreateOtpDto } from "./dto/create-otp.dto";
import { VerifyDto } from "./dto/verify-otp.dto";

@ApiTags("OTP")
@Controller("otp")
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post("verify")
  @ApiOperation({ summary: "Verify OTP code for a phone number" })
  @ApiBody({ type: VerifyDto })
  @ApiResponse({ status: 200, description: "OTP verified successfully" })
  @ApiResponse({ status: 400, description: "Invalid or expired OTP" })
  async verifyOtp(@Body() dto: VerifyDto) {
    return this.otpService.verifyOtp(dto);
  }

  @Post("send")
  @ApiOperation({ summary: "Regenerate/send a new OTP to the phone number" })
  @ApiBody({ type: CreateOtpDto })
  @ApiResponse({
    status: 201,
    description: "OTP generated and sent successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Bad request or invalid phone number",
  })
  async regenerateOtp(@Body() dto: CreateOtpDto) {
    return this.otpService.generateOtp(dto);
  }
}
