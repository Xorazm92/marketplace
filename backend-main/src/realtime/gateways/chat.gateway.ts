// @ts-nocheck
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { RealtimeGateway } from './realtime.gateway';

@WebSocketGateway({ namespace: '/chat' })
export class ChatGateway {
  constructor(
    private readonly chatService: ChatService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: {
      receiverId: string;
      message: string;
      conversationId?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const token = client.handshake.auth.token;
      const senderId = this.extractUserId(token);

      const message = await this.chatService.sendMessage({
        senderId,
        receiverId: data.receiverId,
        message: data.message,
        conversationId: data.conversationId,
      });

      // Send to receiver if online
      this.realtimeGateway.emitToUser(data.receiverId, 'newMessage', message);

      // Send confirmation to sender
      client.emit('messageSent', message);

      return { success: true, message };
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`conversation:${data.conversationId}`);
    
    // Load recent messages
    const messages = await this.chatService.getMessages(data.conversationId, 50);
    client.emit('conversationMessages', messages);

    return { success: true };
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody() data: { conversationId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const token = client.handshake.auth.token;
    const userId = this.extractUserId(token);

    client.to(`conversation:${data.conversationId}`).emit('userTyping', {
      userId,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { messageIds: string[] },
    @ConnectedSocket() client: Socket,
  ) {
    const token = client.handshake.auth.token;
    const userId = this.extractUserId(token);

    await this.chatService.markMessagesAsRead(data.messageIds, userId);

    // Notify sender
    for (const messageId of data.messageIds) {
      const message = await this.chatService.getMessage(messageId);
      if (message && message.sender_id !== userId) {
        this.realtimeGateway.emitToUser(message.sender_id, 'messageRead', {
          messageId,
          readBy: userId,
        });
      }
    }
  }

  private extractUserId(token: string): string {
    // JWT token'dan userId ni ajratish
    return 'user-id-from-token';
  }
}
