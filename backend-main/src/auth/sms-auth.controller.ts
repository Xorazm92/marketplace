import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus, 
  Logger,
  UseGuards,
  Req,
  Get,
  Query
} from '@nestjs/common';
import { SmsAuthService, SmsLoginResponse } from './sms-auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

class SendOtpDto {
  phoneNumber: string;
}

class VerifyOtpDto {
  phoneNumber: string;
  otp: string;
}

@ApiTags('auth')
@Controller('auth/sms')
export class SmsAuthController {
  private readonly logger = new Logger(SmsAuthController.name);

  constructor(private readonly smsAuthService: SmsAuthService) {}

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP to phone number' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid phone number' })
  @ApiResponse({ status: 500, description: 'Failed to send OTP' })
  @ApiBody({ type: SendOtpDto })
  async sendOtp(@Body() body: SendOtpDto): Promise<SmsLoginResponse> {
    this.logger.log(`Sending OTP to ${body.phoneNumber}`);
    return this.smsAuthService.sendOtp(body.phoneNumber);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and authenticate user' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired OTP' })
  @ApiResponse({ status: 500, description: 'Failed to verify OTP' })
  @ApiBody({ type: VerifyOtpDto })
  async verifyOtp(@Body() body: VerifyOtpDto) {
    this.logger.log(`Verifying OTP for ${body.phoneNumber}`);
    return this.smsAuthService.verifyOtp(body.phoneNumber, body.otp);
  }

  @UseGuards(JwtAuthGuard)
  @Get('test-auth')
  @ApiOperation({ summary: 'Test protected SMS auth endpoint' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  testAuth(@Req() req: any) {
    return { 
      message: 'Successfully authenticated with SMS',
      user: req.user 
    };
  }
}
