import { Resolver } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { User } from '../user/user.type';
import { LiveChatroomService } from './live-chatroom.service';
import { UserService } from '../user/user.service';
import { Subscription, Args, Context, Mutation } from '@nestjs/graphql';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    phone_number: string;
  };
}
import { UseFilters, UseGuards } from '@nestjs/common';
import { GraphqlAuthGuard } from '../guards/graphql-auth.guard';
import { GraphQLErrorFilter } from '../filters/custom-exception.filter';
@Resolver()
export class LiveChatroomResolver {
  private pubSub: PubSub;
  constructor(
    private readonly liveChatroomService: LiveChatroomService,
    private readonly userService: UserService,
  ) {
    this.pubSub = new PubSub();
  }

  @Subscription(() => [User], {
    nullable: true,
    resolve: (value) => value.liveUsers,
    filter: (payload, variables) => {
      return payload.chatroomId === variables.chatroomId;
    },
  })
  liveUsersInChatroom(@Args('chatroomId') chatroomId: number) {
    return this.pubSub.asyncIterableIterator(`liveUsersInChatroom.${chatroomId}`);
  }

  @UseFilters(GraphQLErrorFilter)
  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => Boolean)
  async enterChatroom(
    @Args('chatroomId') chatroomId: number,
    @Context() context: { req: AuthenticatedRequest },
  ) {
    if (context.req.user?.id) {
      const user = await this.userService.getUser(context.req.user.id);
      await this.liveChatroomService.addLiveUserToChatroom(chatroomId, user);
      const liveUsers = await this.liveChatroomService
        .getLiveUsersForChatroom(chatroomId)
        .catch((err) => {
          console.log('getLiveUsersForChatroom error', err);
        });

      await this.pubSub
        .publish(`liveUsersInChatroom.${chatroomId}`, {
          liveUsers,
          chatroomId,
        })
        .catch((err) => {
          console.log('pubSub error', err);
        });
      return true;
    }

  }

  @UseFilters(GraphQLErrorFilter)
  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => Boolean)
  async leaveChatroom(
    @Args('chatroomId') chatroomId: number,
    @Context() context: { req: AuthenticatedRequest },
  ) {
    if (context.req.user?.id) {
      const user = await this.userService.getUser(context.req.user.id);
      await this.liveChatroomService.removeLiveUserFromChatroom(chatroomId, user);
      const liveUsers = await this.liveChatroomService.getLiveUsersForChatroom(
        chatroomId,
      );
      await this.pubSub.publish(`liveUsersInChatroom.${chatroomId}`, {
        liveUsers,
        chatroomId,
      });

      return true;
    }
    return null
  }
}
