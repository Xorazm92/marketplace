import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { User } from '../user/user.type';

@Injectable()
export class LiveChatroomService {
  private redisClient: Redis;

  constructor() {
    // Redis connection temporarily disabled to avoid connection errors
    // this.redisClient = new Redis({
    //   username: 'default',
    //   password: process.env.REDIS_PASSWORD,
    //   host: process.env.REDIS_HOST || 'localhost',
    //   port: parseInt(process.env.REDIS_PORT || '6379', 10),
    // });
  }

  async addLiveUserToChatroom(chatroomId: number, user: User): Promise<void> {
    // Redis functionality temporarily disabled
    console.log(`Adding user ${user.id} to chatroom ${chatroomId} (Redis disabled)`);
    return;
  }

  async removeLiveUserFromChatroom(
    chatroomId: number,
    user: User,
  ): Promise<void> {
    // Redis functionality temporarily disabled
    console.log(`Removing user ${user.id} from chatroom ${chatroomId} (Redis disabled)`);
    return;
  }
  async getLiveUsersForChatroom(chatroomId: number): Promise<User[]> {
    // Redis functionality temporarily disabled
    console.log(`Getting live users for chatroom ${chatroomId} (Redis disabled)`);
    return [];
  }
}
