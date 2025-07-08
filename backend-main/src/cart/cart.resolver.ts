import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { CartService } from './cart.service';
import { Cart } from './types/cart.types';
import { AddToCartDto, UpdateCartItemDto, RemoveFromCartDto } from './dto/cart.dto';
import { GraphqlAuthGuard } from '../chat/guards/graphql-auth.guard';
import { Request } from 'express';

@Resolver(() => Cart)
export class CartResolver {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(GraphqlAuthGuard)
  @Query(() => Cart)
  async getCart(@Context() context: { req: Request }) {
    const userId = context.req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.cartService.getOrCreateCart(userId);
  }

  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => Cart)
  async addToCart(
    @Args('input') addToCartDto: AddToCartDto,
    @Context() context: { req: Request }
  ) {
    const userId = context.req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.cartService.addToCart(userId, addToCartDto);
  }

  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => Cart)
  async updateCartItem(
    @Args('input') updateCartItemDto: UpdateCartItemDto,
    @Context() context: { req: Request }
  ) {
    const userId = context.req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.cartService.updateCartItem(userId, updateCartItemDto);
  }

  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => Cart)
  async removeFromCart(
    @Args('input') removeFromCartDto: RemoveFromCartDto,
    @Context() context: { req: Request }
  ) {
    const userId = context.req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.cartService.removeFromCart(userId, removeFromCartDto);
  }

  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => Cart)
  async clearCart(@Context() context: { req: Request }) {
    const userId = context.req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.cartService.clearCart(userId);
  }
}
