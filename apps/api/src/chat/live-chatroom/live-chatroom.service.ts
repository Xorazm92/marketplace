import { Injectable } from '@nestjs/common';
// import Redis from 'ioredis';
import { User } from '../user/user.type';

@Injectable()
export class LiveChatroomService {
  // private redisClient: Redis;
  private mockStorage = new Map<string, Set<string>>();

  constructor() {
    // Temporarily disable Redis connection
    // this.redisClient = new Redis({
    //   username: 'default',
    //   password: process.env.REDIS_PASSWORD,
    //   host: process.env.REDIS_HOST,
    //   port: parseInt(process.env.REDIS_PORT || '18243', 10),
    // });
  }

  async addLiveUserToChatroom(chatroomId: number, user: User): Promise<void> {
    const existingLiveUsers = await this.getLiveUsersForChatroom(chatroomId);

    const existingUser = existingLiveUsers.find(
      (liveUser) => liveUser.id === user.id,
    );
    if (existingUser) {
      return;
    }

    // Mock implementation without Redis
    const key = `liveUsers:chatroom:${chatroomId}`;
    if (!this.mockStorage.has(key)) {
      this.mockStorage.set(key, new Set());
    }
    this.mockStorage.get(key)!.add(JSON.stringify(user));
  }

  async removeLiveUserFromChatroom(
    chatroomId: number,
    user: User,
  ): Promise<void> {
    // Mock implementation without Redis
    const key = `liveUsers:chatroom:${chatroomId}`;
    const userSet = this.mockStorage.get(key);
    if (userSet) {
      userSet.delete(JSON.stringify(user));
      console.log('removeLiveUserFromChatroom success');
    }
  }

  async getLiveUsersForChatroom(chatroomId: number): Promise<User[]> {
    // Mock implementation without Redis
    const key = `liveUsers:chatroom:${chatroomId}`;
    const userSet = this.mockStorage.get(key);

    if (!userSet) {
      return [];
    }

    return Array.from(userSet).map((user) => JSON.parse(user));
  }
}
