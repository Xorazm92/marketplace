import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PayPalService } from './services/paypal.service';
import { StripeService } from './services/stripe.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [PaymentController],
  providers: [PaymentService, PayPalService, StripeService],
  exports: [PaymentService, PayPalService, StripeService],
})
export class PaymentModule {}
