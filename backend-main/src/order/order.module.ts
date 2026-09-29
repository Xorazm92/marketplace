import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { AdminOrderController, OrderController, ShippingController } from './order.controller';

@Module({
  controllers: [OrderController, AdminOrderController, ShippingController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
