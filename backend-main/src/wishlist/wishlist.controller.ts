
import { Controller, Get, Post, Delete, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { UserGuard } from '../guards/user.guard';
import { GetCurrentUserId } from '../decorators/get-current-user-id.decorator';

@ApiTags('❤️ Wishlist')
@Controller('wishlist')
@UseGuards(UserGuard)
@ApiBearerAuth('JWT-auth')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get user wishlist' })
  @ApiResponse({ status: 200, description: 'Wishlist retrieved successfully' })
  async getUserWishlist(@GetCurrentUserId() userId: number) {
    return this.wishlistService.getOrCreateWishlist(userId);
  }

  @Post('product/:productId')
  @ApiOperation({ summary: 'Add product to wishlist' })
  @ApiResponse({ status: 201, description: 'Product added to wishlist' })
  async addToWishlist(
    @GetCurrentUserId() userId: number,
    @Param('productId', ParseIntPipe) productId: number
  ) {
    return this.wishlistService.addToWishlist(userId, { product_id: productId });
  }

  @Delete('product/:productId')
  @ApiOperation({ summary: 'Remove product from wishlist' })
  @ApiResponse({ status: 200, description: 'Product removed from wishlist' })
  async removeFromWishlist(
    @GetCurrentUserId() userId: number,
    @Param('productId', ParseIntPipe) productId: number
  ) {
    return this.wishlistService.removeFromWishlist(userId, { product_id: productId });
  }

  @Get('check/:productId')
  @ApiOperation({ summary: 'Check if product is in wishlist' })
  @ApiResponse({ status: 200, description: 'Wishlist status checked' })
  async isInWishlist(
    @GetCurrentUserId() userId: number,
    @Param('productId', ParseIntPipe) productId: number
  ) {
    return this.wishlistService.isInWishlist(userId, productId);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get wishlist items count' })
  @ApiResponse({ status: 200, description: 'Wishlist count retrieved' })
  async getWishlistCount(@GetCurrentUserId() userId: number) {
    const wishlist = await this.wishlistService.getOrCreateWishlist(userId);
    return wishlist.items?.length || 0;
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Clear entire wishlist' })
  @ApiResponse({ status: 200, description: 'Wishlist cleared successfully' })
  async clearWishlist(@GetCurrentUserId() userId: number) {
    return this.wishlistService.clearWishlist(userId);
  }
}
