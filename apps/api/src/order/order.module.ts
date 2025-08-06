import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderResolver } from './order.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OrderController],
  providers: [OrderService, OrderResolver],
  exports: [OrderService],
})
export class OrderModule {}
