// @ts-nocheck
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'https://inbola.uz'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private readonly connectedUsers = new Map<string, string[]>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('Real-time gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;
      
      client.join(`user:${userId}`);
      
      // Store user connection
      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, []);
      }
      this.connectedUsers.get(userId).push(client.id);

      // Update online status
      await this.redisService.set(`online:${userId}`, 'true', 300); // 5 minutes

      this.logger.log(`User ${userId} connected`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (token) {
        const payload = this.jwtService.verify(token);
        const userId = payload.sub;

        const userSockets = this.connectedUsers.get(userId);
        if (userSockets) {
          const index = userSockets.indexOf(client.id);
          if (index > -1) {
            userSockets.splice(index, 1);
          }
          
          if (userSockets.length === 0) {
            this.connectedUsers.delete(userId);
            await this.redisService.del(`online:${userId}`);
          }
        }

        this.logger.log(`User ${userId} disconnected`);
      }
    } catch (error) {
      this.logger.error(`Disconnection error: ${error.message}`);
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.room);
    return { success: true, message: `Joined room ${data.room}` };
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.room);
    return { success: true, message: `Left room ${data.room}` };
  }

  async emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  async emitToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
  }

  async emitToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  getUserRooms(userId: string): string[] {
    return this.connectedUsers.get(userId) || [];
  }

  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}
