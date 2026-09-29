import { Module } from '@nestjs/common';
import { OrderModule } from '../order/order.module';
import { PaymeService } from './payme.service';
import { ClickService } from './click.service';
import { PaymentsController } from './payments.controller';

// Uzum hozircha ulanmagan: uning merchant API hujjati va test kalitlari
// berilgunicha taxmin qilingan protokol pul oqimiga qo'yilmaydi.
@Module({
  imports: [OrderModule],
  controllers: [PaymentsController],
  providers: [PaymeService, ClickService],
  exports: [PaymeService, ClickService],
})
export class PaymentsModule {}
