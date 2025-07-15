
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { UserGuard } from '../guards/user.guard';
import { AdminGuard } from '../guards/admin.guard';
import { GetCurrentUserId } from '../decorators/get-current-user-id.decorator';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @UseGuards(UserGuard)
  @ApiBearerAuth('inbola')
  @ApiOperation({ summary: 'Create a new review' })
  create(
    @Body() createReviewDto: CreateReviewDto,
    @GetCurrentUserId() userId: number
  ) {
    return this.reviewService.create(createReviewDto, userId);
  }

  @Get('product/:id')
  @ApiOperation({ summary: 'Get reviews for a product' })
  findByProduct(
    @Param('id') id: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    return this.reviewService.findByProduct(+id, +page, +limit);
  }

  @Get('product/:id/stats')
  @ApiOperation({ summary: 'Get rating statistics for a product' })
  getProductRatingStats(@Param('id') id: string) {
    return this.reviewService.getProductRatingStats(+id);
  }

  @Post(':id/helpful')
  @UseGuards(UserGuard)
  @ApiBearerAuth('inbola')
  @ApiOperation({ summary: 'Mark review as helpful' })
  markHelpful(
    @Param('id') id: string,
    @GetCurrentUserId() userId: number
  ) {
    return this.reviewService.markHelpful(+id, userId);
  }

  @Get('moderation')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('inbola')
  @ApiOperation({ summary: 'Get reviews for moderation' })
  getReviewsForModeration(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20'
  ) {
    return this.reviewService.getReviewsForModeration(+page, +limit);
  }

  @Patch(':id')
  @UseGuards(UserGuard)
  @ApiBearerAuth('inbola')
  @ApiOperation({ summary: 'Update a review' })
  update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @GetCurrentUserId() userId: number
  ) {
    return this.reviewService.update(+id, updateReviewDto, userId);
  }

  @Delete(':id')
  @UseGuards(UserGuard)
  @ApiBearerAuth('inbola')
  @ApiOperation({ summary: 'Delete a review' })
  remove(
    @Param('id') id: string,
    @GetCurrentUserId() userId: number
  ) {
    return this.reviewService.remove(+id, userId);
  }
}
