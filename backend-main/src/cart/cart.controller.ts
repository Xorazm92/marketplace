
import { Controller, Get, Post, Put, Delete, Body, UseGuards, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto, RemoveFromCartDto } from './dto/cart.dto';
import { UserGuard } from '../guards/user.guard';
import { User } from '@prisma/client';
import { GetCurrentUserId } from '../decorators/get-current-user-id.decorator';

@ApiTags('🛒 Cart')
@Controller('cart')
@UseGuards(UserGuard)
@ApiBearerAuth('JWT-auth')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get user cart' })
  @ApiResponse({ status: 200, description: 'Cart retrieved successfully' })
  async getUserCart(@GetCurrentUserId() userId: number) {
    return this.cartService.getUserCart(userId);
  }

  @Post('add')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiBody({ type: AddToCartDto })
  @ApiResponse({ status: 201, description: 'Item added to cart successfully' })
  async addToCart(
    @GetCurrentUserId() userId: number,
    @Body() body: AddToCartDto
  ) {
    return this.cartService.addToCart(userId, body);
  }

  @Put('update')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiResponse({ status: 200, description: 'Cart item updated successfully' })
  async updateCartItem(
    @GetCurrentUserId() userId: number,
    @Body() body: UpdateCartItemDto
  ) {
    return this.cartService.updateCartItem(userId, body);
  }

  @Delete('remove')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({ status: 200, description: 'Item removed from cart successfully' })
  async removeFromCart(
    @GetCurrentUserId() userId: number,
    @Body() body: RemoveFromCartDto
  ) {
    return this.cartService.removeFromCart(userId, body);
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Clear entire cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared successfully' })
  async clearCart(@GetCurrentUserId() userId: number) {
    return this.cartService.clearCart(userId);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get cart items count' })
  @ApiResponse({ status: 200, description: 'Cart count retrieved successfully' })
  async getCartItemsCount(@GetCurrentUserId() userId: number) {
    return this.cartService.getCartCount(userId);
  }
}
