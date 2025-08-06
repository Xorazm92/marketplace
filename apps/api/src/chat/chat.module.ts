import { Module } from '@nestjs/common';
import { LiveChatroomModule } from './live-chatroom/live-chatroom.module';
import { ChatroomModule } from './chatroom/chatroom.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    LiveChatroomModule,
    ChatroomModule,
    UserModule,
  ],
  providers: [],
  controllers: [],
  exports: [
    LiveChatroomModule,
    ChatroomModule,
    UserModule,
  ]
})
export class ChatModule {}