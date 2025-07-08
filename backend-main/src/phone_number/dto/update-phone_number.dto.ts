import { PartialType } from '@nestjs/swagger';
import { CreatePhoneNumberDto } from './create-phone_number.dto';

export class UpdatePhoneNumberDto extends PartialType(CreatePhoneNumberDto) {}
