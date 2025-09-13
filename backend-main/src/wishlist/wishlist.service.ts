import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToWishlistDto, RemoveFromWishlistDto } from './dto/wishlist.dto';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateWishlist(userId: number) {
    let wishlist = await this.prisma.wishlist.findUnique({
      where: { user_id: userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                product_image: true,
                currency: true,
              },
            },
          },
        },
      },
    });

    if (!wishlist) {
      wishlist = await this.prisma.wishlist.create({
        data: { user_id: userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  product_image: true,
                  currency: true,
                },
              },
            },
          },
        },
      });
    }

    return {
      ...wishlist,
      total_items: wishlist.items.length,
    };
  }

  async addToWishlist(userId: number, addToWishlistDto: AddToWishlistDto) {
    const { product_id } = addToWishlistDto;

    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: product_id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Get or create wishlist
    const wishlist = await this.getOrCreateWishlist(userId);

    // Check if item already exists in wishlist
    const existingItem = await this.prisma.wishlistItem.findUnique({
      where: {
        wishlist_id_product_id: {
          wishlist_id: wishlist.id,
          product_id,
        },
      },
    });

    if (existingItem) {
      throw new BadRequestException('Product already in wishlist');
    }

    // Create new wishlist item
    await this.prisma.wishlistItem.create({
      data: {
        wishlist_id: wishlist.id,
        product_id,
      },
    });

    return this.getOrCreateWishlist(userId);
  }

  async removeFromWishlist(userId: number, removeFromWishlistDto: RemoveFromWishlistDto) {
    const { product_id } = removeFromWishlistDto;

    const wishlist = await this.prisma.wishlist.findUnique({
      where: { user_id: userId },
    });

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    const wishlistItem = await this.prisma.wishlistItem.findUnique({
      where: {
        wishlist_id_product_id: {
          wishlist_id: wishlist.id,
          product_id,
        },
      },
    });

    if (!wishlistItem) {
      throw new NotFoundException('Product not found in wishlist');
    }

    await this.prisma.wishlistItem.delete({
      where: { id: wishlistItem.id },
    });

    return this.getOrCreateWishlist(userId);
  }

  async clearWishlist(userId: number) {
    const wishlist = await this.prisma.wishlist.findUnique({
      where: { user_id: userId },
    });

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    await this.prisma.wishlistItem.deleteMany({
      where: { wishlist_id: wishlist.id },
    });

    return this.getOrCreateWishlist(userId);
  }

  async isInWishlist(userId: number, productId: number): Promise<boolean> {
    const wishlist = await this.prisma.wishlist.findUnique({
      where: { user_id: userId },
    });

    if (!wishlist) {
      return false;
    }

    const wishlistItem = await this.prisma.wishlistItem.findUnique({
      where: {
        wishlist_id_product_id: {
          wishlist_id: wishlist.id,
          product_id: productId,
        },
      },
    });

    return !!wishlistItem;
  }
}