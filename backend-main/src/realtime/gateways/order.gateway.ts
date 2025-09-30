// @ts-nocheck
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { OrderService } from '../services/order.service';
import { RealtimeGateway } from './realtime.gateway';

@WebSocketGateway({ namespace: '/orders' })
export class OrderGateway {
  constructor(
    private readonly orderService: OrderService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  @SubscribeMessage('trackOrder')
  async handleTrackOrder(
    @MessageBody() data: { orderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`order:${data.orderId}`);
    
    const order = await this.orderService.getOrder(data.orderId);
    client.emit('orderUpdate', order);

    return { success: true };
  }

  @SubscribeMessage('subscribeToUserOrders')
  async handleSubscribeToUserOrders(
    @ConnectedSocket() client: Socket,
  ) {
    const token = client.handshake.auth.token;
    const userId = this.extractUserId(token);
    
    client.join(`user-orders:${userId}`);
    
    const orders = await this.orderService.getUserOrders(userId);
    client.emit('userOrders', orders);

    return { success: true };
  }

  @SubscribeMessage('subscribeToSellerOrders')
  async handleSubscribeToSellerOrders(
    @ConnectedSocket() client: Socket,
  ) {
    const token = client.handshake.auth.token;
    const sellerId = this.extractUserId(token);
    
    client.join(`seller-orders:${sellerId}`);
    
    const orders = await this.orderService.getSellerOrders(sellerId);
    client.emit('sellerOrders', orders);

    return { success: true };
  }

  async emitOrderStatusUpdate(orderId: string, status: string, trackingInfo?: any) {
    const update = {
      orderId,
      status,
      trackingInfo,
      timestamp: new Date(),
    };

    this.realtimeGateway.emitToRoom(`order:${orderId}`, 'orderStatusUpdate', update);
    
    // Also notify the user
    const order = await this.orderService.getOrder(orderId);
    this.realtimeGateway.emitToUser(order.user_id, 'orderStatusUpdate', update);
  }

  async emitOrderCreated(order: any) {
    // Notify user
    this.realtimeGateway.emitToUser(order.user_id, 'newOrder', {
      order,
      timestamp: new Date(),
    });

    // Notify seller
    this.realtimeGateway.emitToUser(order.seller_id, 'newOrder', {
      order,
      timestamp: new Date(),
    });
  }

  async emitOrderCancelled(orderId: string, reason: string) {
    this.realtimeGateway.emitToRoom(`order:${orderId}`, 'orderCancelled', {
      orderId,
      reason,
      timestamp: new Date(),
    });

    const order = await this.orderService.getOrder(orderId);
    this.realtimeGateway.emitToUser(order.user_id, 'orderCancelled', {
      orderId,
      reason,
      timestamp: new Date(),
    });
  }

  private extractUserId(token: string): string {
    return 'user-id-from-token';
  }
}
