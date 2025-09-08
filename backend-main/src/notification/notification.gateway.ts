import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NotificationService } from './notification.service';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);
  private userSockets = new Map<number, Socket[]>(); // userId -> Socket[]

  constructor(
    private readonly jwtService: JwtService,
    private readonly notificationService: NotificationService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      
      if (!token) {
        this.logger.warn('Client connected without token');
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub || payload.userId;

      if (!userId) {
        this.logger.warn('Invalid token payload');
        client.disconnect();
        return;
      }

      // Store user socket connection
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, []);
      }
      this.userSockets.get(userId).push(client);

      // Store userId in socket for later use
      client.data.userId = userId;

      // Join user to their personal room
      client.join(`user_${userId}`);

      this.logger.log(`User ${userId} connected to notifications`);

      // Send unread count on connection
      const unreadCount = await this.notificationService.getUnreadCount(userId);
      client.emit('unread_count', { count: unreadCount });

    } catch (error) {
      this.logger.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId && this.userSockets.has(userId)) {
      const sockets = this.userSockets.get(userId);
      const index = sockets.indexOf(client);
      if (index > -1) {
        sockets.splice(index, 1);
      }
      if (sockets.length === 0) {
        this.userSockets.delete(userId);
      }
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(@MessageBody() data: { room: string }, @ConnectedSocket() client: Socket) {
    client.join(data.room);
    return { status: 'joined', room: data.room };
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(@MessageBody() data: { room: string }, @ConnectedSocket() client: Socket) {
    client.leave(data.room);
    return { status: 'left', room: data.room };
  }

  @SubscribeMessage('mark_as_read')
  async handleMarkAsRead(@MessageBody() data: { notificationId: number }, @ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    if (!userId) return;

    try {
      await this.notificationService.markAsRead(userId, data.notificationId);
      const unreadCount = await this.notificationService.getUnreadCount(userId);
      
      // Send updated unread count to all user's connections
      this.sendToUser(userId, 'unread_count', { count: unreadCount });
      
      return { status: 'success' };
    } catch (error) {
      this.logger.error('Error marking notification as read:', error);
      return { status: 'error', message: error.message };
    }
  }

  // Method to send notification to specific user
  async sendNotificationToUser(userId: number, notification: any) {
    this.sendToUser(userId, 'new_notification', notification);
    
    // Also send updated unread count
    const unreadCount = await this.notificationService.getUnreadCount(userId);
    this.sendToUser(userId, 'unread_count', { count: unreadCount });
  }

  // Method to send notification to all users
  sendNotificationToAll(notification: any) {
    this.server.emit('new_notification', notification);
  }

  // Method to send notification to users in a specific room
  sendNotificationToRoom(room: string, notification: any) {
    this.server.to(room).emit('new_notification', notification);
  }

  // Helper method to send message to all user's connections
  private sendToUser(userId: number, event: string, data: any) {
    const userRoom = `user_${userId}`;
    this.server.to(userRoom).emit(event, data);
  }

  // Method to broadcast unread count update
  async broadcastUnreadCount(userId: number) {
    const unreadCount = await this.notificationService.getUnreadCount(userId);
    this.sendToUser(userId, 'unread_count', { count: unreadCount });
  }
}
