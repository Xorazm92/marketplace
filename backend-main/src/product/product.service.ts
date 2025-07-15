
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto, userId?: number) {
    const { product_images, ...productData } = createProductDto;
    
    const product = await this.prisma.product.create({
      data: {
        ...productData,
        user_id: userId,
        product_image: product_images ? {
          create: product_images.map(url => ({ url }))
        } : undefined
      },
      include: {
        product_image: true,
        brand: true,
        category: true,
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            profile_img: true
          }
        }
      }
    });

    return product;
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    search?: string,
    category?: string,
    brand?: string,
    minPrice?: number,
    maxPrice?: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ) {
    const skip = (page - 1) * limit;
    
    const where: any = {
      is_active: true,
      is_checked: 'APPROVED'
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ];
    }

    if (category) {
      where.category = {
        slug: category
      };
    }

    if (brand) {
      where.brand = {
        name: brand
      };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }

    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take: limit,
        where,
        include: {
          product_image: true,
          brand: true,
          category: true,
          reviews: {
            select: {
              rating: true
            }
          }
        },
        orderBy
      }),
      this.prisma.product.count({ where })
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        product_image: true,
        brand: true,
        category: true,
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            profile_img: true,
            phone_number: true
          }
        },
        reviews: {
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
        }
      }
    });

    if (product) {
      // Increment view count
      await this.prisma.product.update({
        where: { id },
        data: { view_count: { increment: 1 } }
      });
    }

    return product;
  }

  async getRecommendations(productId: number, limit: number = 8) {
    const currentProduct = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { category_id: true, brand_id: true }
    });

    if (!currentProduct) return [];

    return this.prisma.product.findMany({
      where: {
        id: { not: productId },
        is_active: true,
        is_checked: 'APPROVED',
        OR: [
          { category_id: currentProduct.category_id },
          { brand_id: currentProduct.brand_id }
        ]
      },
      take: limit,
      include: {
        product_image: true,
        brand: true,
        category: true,
        reviews: {
          select: {
            rating: true
          }
        }
      },
      orderBy: { view_count: 'desc' }
    });
  }

  async getFeaturedProducts(limit: number = 12) {
    return this.prisma.product.findMany({
      where: {
        is_active: true,
        is_checked: 'APPROVED',
        is_top: true
      },
      take: limit,
      include: {
        product_image: true,
        brand: true,
        category: true,
        reviews: {
          select: {
            rating: true
          }
        }
      },
      orderBy: { view_count: 'desc' }
    });
  }

  async searchProducts(query: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const where = {
      is_active: true,
      is_checked: 'APPROVED' as const,
      OR: [
        { title: { contains: query, mode: 'insensitive' as const } },
        { description: { contains: query, mode: 'insensitive' as const } },
        { tags: { has: query } },
        { brand: { name: { contains: query, mode: 'insensitive' as const } } },
        { category: { name: { contains: query, mode: 'insensitive' as const } } }
      ]
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take: limit,
        where,
        include: {
          product_image: true,
          brand: true,
          category: true,
          reviews: {
            select: {
              rating: true
            }
          }
        },
        orderBy: { view_count: 'desc' }
      }),
      this.prisma.product.count({ where })
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { product_images, ...productData } = updateProductDto;

    if (product_images) {
      // Delete existing images
      await this.prisma.productImage.deleteMany({
        where: { product_id: id }
      });
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...productData,
        product_image: product_images ? {
          create: product_images.map(url => ({ url }))
        } : undefined
      },
      include: {
        product_image: true,
        brand: true,
        category: true,
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            profile_img: true
          }
        }
      }
    });
  }

  async remove(id: number) {
    return this.prisma.product.update({
      where: { id },
      data: { is_deleted: true, is_active: false }
    });
  }
}
