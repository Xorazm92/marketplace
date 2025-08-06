import { Controller, Get, Post, Put, Delete, Body, UseGuards, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto, RemoveFromCartDto } from './dto/cart.dto';
import { UserGuard } from '../guards/user.guard';
import { OptionalUserGuard } from '../common/guards/optional-user.guard';
import { GetCurrentUserId } from '../decorators/get-current-user-id.decorator';
import { GetCurrentUserIdOptional } from '../decorators/get-current-user-id-optional.decorator';

@ApiTags('Cart')
@ApiBearerAuth('inbola')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @UseGuards(OptionalUserGuard)
  @ApiOperation({ summary: 'Get user cart' })
  @ApiResponse({ status: 200, description: 'Cart retrieved successfully' })
  async getCart(@GetCurrentUserIdOptional() userId?: number) {
    if (!userId) {
      // Login qilmagan foydalanuvchi uchun bo'sh cart qaytarish
      return {
        items: [],
        total_amount: 0,
        total_items: 0
      };
    }
    return this.cartService.getOrCreateCart(userId);
  }

  @Post('add')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiBody({ type: AddToCartDto })
  @ApiResponse({ status: 201, description: 'Item added to cart successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async addToCart(
    @Body() addToCartDto: AddToCartDto,
    @GetCurrentUserId() userId: number,
  ) {
    return this.cartService.addToCart(userId, addToCartDto);
  }

  @Put('update')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiResponse({ status: 200, description: 'Cart item updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  async updateCartItem(
    @Body() updateCartItemDto: UpdateCartItemDto,
    @GetCurrentUserId() userId: number,
  ) {
    return this.cartService.updateCartItem(userId, updateCartItemDto);
  }

  @Delete('remove')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiBody({ type: RemoveFromCartDto })
  @ApiResponse({ status: 200, description: 'Item removed from cart successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  async removeFromCart(
    @Body() removeFromCartDto: RemoveFromCartDto,
    @GetCurrentUserId() userId: number,
  ) {
    return this.cartService.removeFromCart(userId, removeFromCartDto);
  }

  @Delete('clear')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'Clear all items from cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  async clearCart(@GetCurrentUserId() userId: number) {
    return this.cartService.clearCart(userId);
  }
}
