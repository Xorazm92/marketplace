import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { Wishlist } from './types/wishlist.types';
import { AddToWishlistDto, RemoveFromWishlistDto } from './dto/wishlist.dto';
import { GraphqlAuthGuard } from '../chat/guards/graphql-auth.guard';
import { Request } from 'express';

@Resolver(() => Wishlist)
export class WishlistResolver {
  constructor(private readonly wishlistService: WishlistService) {}

  @UseGuards(GraphqlAuthGuard)
  @Query(() => Wishlist)
  async getWishlist(@Context() context: { req: Request }) {
    const userId = context.req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.wishlistService.getOrCreateWishlist(userId);
  }

  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => Wishlist)
  async addToWishlist(
    @Args('input') addToWishlistDto: AddToWishlistDto,
    @Context() context: { req: Request }
  ) {
    const userId = context.req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.wishlistService.addToWishlist(userId, addToWishlistDto);
  }

  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => Wishlist)
  async removeFromWishlist(
    @Args('input') removeFromWishlistDto: RemoveFromWishlistDto,
    @Context() context: { req: Request }
  ) {
    const userId = context.req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.wishlistService.removeFromWishlist(userId, removeFromWishlistDto);
  }

  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => Wishlist)
  async clearWishlist(@Context() context: { req: Request }) {
    const userId = context.req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.wishlistService.clearWishlist(userId);
  }

  @UseGuards(GraphqlAuthGuard)
  @Query(() => Boolean)
  async isInWishlist(
    @Args('product_id') productId: number,
    @Context() context: { req: Request }
  ) {
    const userId = context.req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.wishlistService.isInWishlist(userId, productId);
  }
}
