import { Resolver, Query, Context, Mutation, Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './user.type';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    phone_number: string;
  };
}
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { GraphqlAuthGuard } from '../guards/graphql-auth.guard';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
// GraphQL file upload disabled; using imageUrl string instead to avoid schema issues.
@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) { }

  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => User)
  async updateProfile(
    @Args('first_name') first_name: string,
    @Context() context: { req: AuthenticatedRequest },
    @Args('imageUrl', { nullable: true }) imageUrl?: string,
  ) {
    const profile_img = imageUrl ?? null;
    const userId = context.req.user?.id;

    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.userService.updateProfile(userId, first_name, profile_img);
  }

  // If needed, implement REST upload endpoint and pass its URL as imageUrl.

  @UseGuards(GraphqlAuthGuard)
  @Query(() => [User])
  async searchUsers(
    @Args('first_name') first_name: string,
    @Context() context: { req: AuthenticatedRequest },
  ) {
    if (context.req.user)
      return this.userService.searchUsers(first_name, context.req.user?.id);
  }

  @UseGuards(GraphqlAuthGuard)
  @Query(() => User)
  async getUser(@Context() context: { req: AuthenticatedRequest }) {
    return this.userService.getUser(context.req.user.id);
  }

  @UseGuards(GraphqlAuthGuard)
  @Query(() => [User])
  getUsersOfChatroom(@Args('chatroomId') chatroomId: number) {
    return this.userService.getUsersOfChatroom(chatroomId);
  }
}
