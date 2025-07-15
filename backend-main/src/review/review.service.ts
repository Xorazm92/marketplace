
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async create(createReviewDto: CreateReviewDto, userId: number) {
    const { images, ...reviewData } = createReviewDto;

    // Check if user has purchased this product
    const hasPurchased = await this.prisma.orderItem.findFirst({
      where: {
        product_id: reviewData.product_id,
        order: {
          user_id: userId,
          status: 'DELIVERED'
        }
      }
    });

    const review = await this.prisma.review.create({
      data: {
        ...reviewData,
        user_id: userId,
        is_verified: !!hasPurchased,
        images: images ? {
          create: images.map(url => ({ url }))
        } : undefined
      },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            profile_img: true
          }
        },
        images: true
      }
    });

    // Update product average rating
    await this.updateProductRating(reviewData.product_id);

    return review;
  }

  async findByProduct(productId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { product_id: productId },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              profile_img: true
            }
          },
          images: true
        },
        orderBy: [
          { is_verified: 'desc' },
          { createdAt: 'desc' }
        ]
      }),
      this.prisma.review.count({ where: { product_id: productId } })
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getProductRatingStats(productId: number) {
    const stats = await this.prisma.review.groupBy({
      by: ['rating'],
      where: { product_id: productId },
      _count: { rating: true }
    });

    const totalReviews = await this.prisma.review.count({
      where: { product_id: productId }
    });

    const avgRating = await this.prisma.review.aggregate({
      where: { product_id: productId },
      _avg: { rating: true }
    });

    return {
      totalReviews,
      averageRating: avgRating._avg.rating || 0,
      ratingDistribution: stats.reduce((acc, stat) => {
        acc[stat.rating] = stat._count.rating;
        return acc;
      }, {} as Record<number, number>)
    };
  }

  async markHelpful(reviewId: number, userId: number) {
    // Check if user already marked this review as helpful
    const existing = await this.prisma.review.findFirst({
      where: {
        id: reviewId,
        // You might want to create a separate table for helpful votes
      }
    });

    return this.prisma.review.update({
      where: { id: reviewId },
      data: { helpful_count: { increment: 1 } }
    });
  }

  async update(id: number, updateReviewDto: UpdateReviewDto, userId: number) {
    const review = await this.prisma.review.update({
      where: { 
        id,
        user_id: userId // Ensure user can only update their own reviews
      },
      data: updateReviewDto,
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            profile_img: true
          }
        },
        images: true
      }
    });

    // Update product average rating
    await this.updateProductRating(review.product_id);

    return review;
  }

  async remove(id: number, userId: number) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      select: { product_id: true, user_id: true }
    });

    if (!review || review.user_id !== userId) {
      throw new Error('Review not found or unauthorized');
    }

    await this.prisma.review.delete({
      where: { id }
    });

    // Update product average rating
    await this.updateProductRating(review.product_id);

    return { message: 'Review deleted successfully' };
  }

  private async updateProductRating(productId: number) {
    const stats = await this.prisma.review.aggregate({
      where: { product_id: productId },
      _avg: { rating: true },
      _count: { rating: true }
    });

    // You might want to add average_rating field to product table
    // await this.prisma.product.update({
    //   where: { id: productId },
    //   data: { 
    //     average_rating: stats._avg.rating || 0,
    //     review_count: stats._count.rating
    //   }
    // });
  }

  async getReviewsForModeration(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              profile_img: true
            }
          },
          product: {
            select: {
              id: true,
              title: true,
              product_image: {
                take: 1
              }
            }
          },
          images: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.review.count()
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}
