
import { Controller, Get, Post, Put, Body, UseGuards, Query, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SellerService } from './seller.service';
import { CreateSellerDto, UpdateSellerDto, VerifySellerDto } from './dto/create-seller.dto';
import { UserGuard } from '../guards/user.guard';
import { AdminGuard } from '../guards/admin.guard';
import { GetCurrentUserId } from '../decorators/get-current-user-id.decorator';

@ApiTags('🏪 Sellers')
@Controller('sellers')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Post('register')
  @UseGuards(UserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Register as a seller' })
  @ApiResponse({ status: 201, description: 'Seller registration successful' })
  async registerSeller(
    @GetCurrentUserId() userId: number,
    @Body() createSellerDto: CreateSellerDto
  ) {
    return this.sellerService.registerSeller(userId, createSellerDto);
  }

  @Get('profile')
  @UseGuards(UserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get seller profile' })
  @ApiResponse({ status: 200, description: 'Seller profile retrieved' })
  async getSellerProfile(@GetCurrentUserId() userId: number) {
    return this.sellerService.getSellerProfile(userId);
  }

  @Put('profile')
  @UseGuards(UserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update seller profile' })
  @ApiResponse({ status: 200, description: 'Seller profile updated' })
  async updateSellerProfile(
    @GetCurrentUserId() userId: number,
    @Body() updateSellerDto: UpdateSellerDto
  ) {
    return this.sellerService.updateSellerProfile(userId, updateSellerDto);
  }

  @Get('analytics')
  @UseGuards(UserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get seller analytics' })
  @ApiResponse({ status: 200, description: 'Seller analytics retrieved' })
  async getSellerAnalytics(@GetCurrentUserId() userId: number) {
    return this.sellerService.getSellerAnalytics(userId);
  }

  // Admin endpoints
  @Get('admin/all')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all sellers (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Sellers list retrieved' })
  async getAllSellers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string
  ) {
    return this.sellerService.getAllSellers(page, limit, status);
  }

  @Put('admin/:sellerId/verify')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Verify seller (Admin only)' })
  @ApiResponse({ status: 200, description: 'Seller verification updated' })
  async verifySeller(
    @Param('sellerId', ParseIntPipe) sellerId: number,
    @Body() verifySellerDto: VerifySellerDto
  ) {
    return this.sellerService.verifySeller(sellerId, verifySellerDto);
  }
}
