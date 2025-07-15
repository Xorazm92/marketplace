import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ClickService } from './services/click.service';
import { PaymeService } from './services/payme.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [PaymentController],
  providers: [PaymentService, ClickService, PaymeService],
  exports: [PaymentService, ClickService, PaymeService],
})
export class PaymentModule {}
