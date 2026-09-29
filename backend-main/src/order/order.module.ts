import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { AdminOrderController, OrderController } from './order.controller';

@Module({
  controllers: [OrderController, AdminOrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
