// @ts-nocheck
import { Module } from '@nestjs/common';
import { RealtimeGateway } from './gateways/realtime.gateway';
import { ChatGateway } from './gateways/chat.gateway';
import { NotificationGateway } from './gateways/notification.gateway';
import { ProductGateway } from './gateways/product.gateway';
import { OrderGateway } from './gateways/order.gateway';
import { InventoryGateway } from './gateways/inventory.gateway';
import { RedisModule } from '../redis/redis.module';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from './services/realtime.service';
import { ChatService } from './services/chat.service';
import { NotificationService } from './services/notification.service';
import { ProductService } from './services/product.service';
import { OrderService } from './services/order.service';
import { InventoryService } from './services/inventory.service';

@Module({
  imports: [RedisModule],
  providers: [
    RealtimeGateway,
    ChatGateway,
    NotificationGateway,
    ProductGateway,
    OrderGateway,
    InventoryGateway,
    RealtimeService,
    ChatService,
    NotificationService,
    ProductService,
    OrderService,
    InventoryService,
    PrismaService,
  ],
  exports: [RealtimeService],
})
export class RealtimeModule {}
