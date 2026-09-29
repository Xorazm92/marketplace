import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { UserGuard } from '../guards/user.guard';
import { GetCurrentUserId } from '../decorators/get-current-user-id.decorator';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

class PageQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviews: ReviewService) {}

  @Get('product/:productId')
  list(@Param('productId', ParseIntPipe) productId: number, @Query() query: PageQuery) {
    return this.reviews.listForProduct(productId, query.page, query.limit);
  }

  @Get('product/:productId/stats')
  stats(@Param('productId', ParseIntPipe) productId: number) {
    return this.reviews.stats(productId);
  }

  @Get('mine')
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  mine(@GetCurrentUserId() userId: number) {
    return this.reviews.mine(userId);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  create(@GetCurrentUserId() userId: number, @Body() dto: CreateReviewDto) {
    return this.reviews.create(userId, dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  update(@GetCurrentUserId() userId: number, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReviewDto) {
    return this.reviews.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  remove(@GetCurrentUserId() userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.reviews.remove(userId, id);
  }
}
