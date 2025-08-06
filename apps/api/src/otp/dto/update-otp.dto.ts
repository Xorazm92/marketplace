import { PartialType } from '@nestjs/swagger';
import { CreateOtpDto } from './create-otp.dto';

export class UpdateOtpDto extends PartialType(CreateOtpDto) {}
