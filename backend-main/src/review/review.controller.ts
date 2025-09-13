import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { UserGuard } from '../guards/user.guard';
import { OptionalUserGuard } from '../common/guards/optional-user.guard';
import { GetCurrentUserId } from '../decorators/get-current-user-id.decorator';

@ApiTags('⭐ Reviews')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('product/:productId')
  @UseGuards(OptionalUserGuard)
  @ApiOperation({ summary: 'Get reviews for a product' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'rating', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Reviews retrieved successfully' })
  async getProductReviews(
    @Param('productId', ParseIntPipe) productId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('rating') rating?: number
  ) {
    return this.reviewService.getProductReviews(productId, { page, limit, rating });
  }

  @Get('product/:productId/stats')
  @ApiOperation({ summary: 'Get review statistics for a product' })
  @ApiResponse({ status: 200, description: 'Review statistics retrieved successfully' })
  async getProductReviewStats(@Param('productId', ParseIntPipe) productId: number) {
    return this.reviewService.getProductRatingStats(productId);
  }

  @Post()
  @UseGuards(UserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new review' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  async createReview(
    @GetCurrentUserId() userId: number,
    @Body() createReviewDto: CreateReviewDto
  ) {
    return this.reviewService.createReview(userId, createReviewDto);
  }

  @Put(':id')
  @UseGuards(UserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a review' })
  @ApiResponse({ status: 200, description: 'Review updated successfully' })
  async updateReview(
    @Param('id', ParseIntPipe) id: number,
    @GetCurrentUserId() userId: number,
    @Body() updateReviewDto: UpdateReviewDto
  ) {
    return this.reviewService.updateReview(id, userId, updateReviewDto);
  }

  @Delete(':id')
  @UseGuards(UserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a review' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  async deleteReview(
    @Param('id', ParseIntPipe) id: number,
    @GetCurrentUserId() userId: number
  ) {
    return this.reviewService.deleteReview(id, userId);
  }

  @Get('user/my-reviews')
  @UseGuards(UserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user reviews' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'User reviews retrieved successfully' })
  async getUserReviews(
    @GetCurrentUserId() userId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.reviewService.getUserReviews(userId, { page, limit });
  }

  @Post(':id/helpful')
  @UseGuards(UserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mark review as helpful' })
  @ApiResponse({ status: 200, description: 'Review marked as helpful' })
  async markReviewHelpful(
    @Param('id', ParseIntPipe) reviewId: number,
    @GetCurrentUserId() userId: number
  ) {
    return this.reviewService.markReviewHelpful(reviewId, userId);
  }

  @Delete(':id/helpful')
  @UseGuards(UserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove helpful mark from review' })
  @ApiResponse({ status: 200, description: 'Helpful mark removed' })
  async removeHelpfulMark(
    @Param('id', ParseIntPipe) reviewId: number,
    @GetCurrentUserId() userId: number
  ) {
    return this.reviewService.removeHelpfulMark(reviewId, userId);
  }

  @Post(':id/report')
  @UseGuards(UserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Report inappropriate review' })
  @ApiResponse({ status: 200, description: 'Review reported successfully' })
  async reportReview(
    @Param('id', ParseIntPipe) reviewId: number,
    @GetCurrentUserId() userId: number,
    @Body('reason') reason: string
  ) {
    return this.reviewService.reportReview(reviewId, userId, reason);
  }
}