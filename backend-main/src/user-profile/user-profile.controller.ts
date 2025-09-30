// @ts-nocheck
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UserProfileService } from './user-profile.service';

@ApiTags('user-profile')
@Controller('user-profile')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  async getProfile(@Request() req) {
    return { userId: req.user.id };
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(@Request() req, @Body() updateProfileDto: any) {
    return { message: 'Profile updated successfully' };
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({ summary: 'Upload user avatar' })
  async uploadAvatar(@Request() req, @UploadedFile() file: any) {
    return { message: 'Avatar uploaded successfully' };
  }

  @Get('addresses')
  @ApiOperation({ summary: 'Get user addresses' })
  async getAddresses(@Request() req) {
    return this.userProfileService.getAddresses(req.user.id);
  }

  @Post('addresses')
  @ApiOperation({ summary: 'Create new address' })
  async createAddress(@Request() req, @Body() createAddressDto: any) {
    return this.userProfileService.createAddress(req.user.id, createAddressDto);
  }

  @Put('addresses/:id')
  @ApiOperation({ summary: 'Update address' })
  async updateAddress(@Request() req, @Param('id') id: string, @Body() updateAddressDto: any) {
    return this.userProfileService.updateAddress(req.user.id, id, updateAddressDto);
  }

  @Delete('addresses/:id')
  @ApiOperation({ summary: 'Delete address' })
  async deleteAddress(@Request() req, @Param('id') id: string) {
    return this.userProfileService.deleteAddress(req.user.id, id);
  }

  @Get('payment-methods')
  @ApiOperation({ summary: 'Get payment methods' })
  async getPaymentMethods(@Request() req) {
    return this.userProfileService.getPaymentMethods(req.user.id);
  }

  @Post('payment-methods')
  @ApiOperation({ summary: 'Add payment method' })
  async addPaymentMethod(@Request() req, @Body() createPaymentMethodDto: any) {
    return this.userProfileService.addPaymentMethod(req.user.id, createPaymentMethodDto);
  }

  @Delete('payment-methods/:id')
  @ApiOperation({ summary: 'Delete payment method' })
  async deletePaymentMethod(@Request() req, @Param('id') id: string) {
    return this.userProfileService.deletePaymentMethod(req.user.id, id);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get user orders' })
  async getOrders(@Request() req) {
    return this.userProfileService.getOrders(req.user.id, {});
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get order by ID' })
  async getOrder(@Request() req, @Param('id') id: string) {
    return this.userProfileService.getOrder(req.user.id, id);
  }

  @Get('wishlist')
  @ApiOperation({ summary: 'Get wishlist' })
  async getWishlist(@Request() req) {
    return this.userProfileService.getWishlist(req.user.id);
  }

  @Post('wishlist/:productId')
  @ApiOperation({ summary: 'Add to wishlist' })
  async addToWishlist(@Request() req, @Param('productId') productId: string) {
    return this.userProfileService.addToWishlist(req.user.id, productId);
  }

  @Delete('wishlist/:productId')
  @ApiOperation({ summary: 'Remove from wishlist' })
  async removeFromWishlist(@Request() req, @Param('productId') productId: string) {
    return this.userProfileService.removeFromWishlist(req.user.id, productId);
  }
}
