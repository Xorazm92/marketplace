import { PartialType } from '@nestjs/swagger';
import { CreatePaymentMethodDto } from './create-payment_method.dto';

export class UpdatePaymentMethodDto extends PartialType(
  CreatePaymentMethodDto,
) {}
