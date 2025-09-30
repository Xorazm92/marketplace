// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  async saveUserActivity(userId: string, activity: string, data?: any) {
    const key = `user_activity:${userId}`;
    const activityData = {
      activity,
      data,
      timestamp: new Date().toISOString(),
    };

    await this.redisService.lpush(key, JSON.stringify(activityData));
    await this.redisService.ltrim(key, 0, 99); // Keep last 100 activities
    await this.redisService.expire(key, 86400); // 24 hours
  }

  async getUserActivity(userId: string, limit: number = 50) {
    const key = `user_activity:${userId}`;
    const activities = await this.redisService.lrange(key, 0, limit - 1);
    
    return activities.map(activity => JSON.parse(activity));
  }

  async trackUserPresence(userId: string) {
    const key = `presence:${userId}`;
    await this.redisService.set(key, new Date().toISOString(), 300); // 5 minutes
  }

  async isUserOnline(userId: string): Promise<boolean> {
    const key = `presence:${userId}`;
    const exists = await this.redisService.exists(key);
    return exists === 1;
  }

  async getOnlineUsers(): Promise<string[]> {
    const keys = await this.redisService.keys('presence:*');
    return keys.map(key => key.replace('presence:', ''));
  }

  async incrementMetric(metric: string, value: number = 1) {
    const key = `metrics:${metric}`;
    await this.redisService.incrby(key, value);
    await this.redisService.expire(key, 3600); // 1 hour
  }

  async getMetric(metric: string): Promise<number> {
    const key = `metrics:${metric}`;
    const value = await this.redisService.get(key);
    return value ? parseInt(value) : 0;
  }

  async broadcastToRoom(room: string, event: string, data: any) {
    // This will be implemented by the gateways
    this.logger.log(`Broadcasting ${event} to room ${room}`);
  }

  async handleConnection(userId: string, socketId: string) {
    await this.saveUserActivity(userId, 'socket_connected', { socketId });
    await this.trackUserPresence(userId);
  }

  async handleDisconnection(userId: string, socketId: string) {
    await this.saveUserActivity(userId, 'socket_disconnected', { socketId });
  }
}
