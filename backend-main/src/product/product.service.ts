
import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RedisService } from '../microservices/redis/redis.service';
import { ChildSafetyService } from '../child-safety/child-safety.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto, userId?: number) {
    const { images, user_id, ...productData } = createProductDto;

    const product = await this.prisma.product.create({
      data: {
        title: productData.title,
        brand_id: productData.brand_id,
        price: productData.price,
        currency_id: productData.currency_id,
        description: productData.description,
        negotiable: productData.negotiable,
        condition: productData.condition ? "new" : "used",
        phone_number: productData.phone_number,
        address_id: productData.address_id ? +productData.address_id : null,
        category_id: productData.category_id,
        age_range: productData.age_range,
        material: productData.material,
        color: productData.color,
        size: productData.size,
        manufacturer: productData.manufacturer,
        safety_info: productData.safety_info,
        weight: productData.weight,
        dimensions: productData.dimensions,
        user_id: userId || user_id || 1,
        is_checked: 'PENDING',
        is_active: false,
        is_deleted: false,
        view_count: 0
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
        { title: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } }
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
        { title: { contains: query } },
        { description: { contains: query } },
        { tags: { contains: query } },
        { brand: { name: { contains: query } } },
        { category: { name: { contains: query } } }
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
    const { images, user_id, ...productData } = updateProductDto;

    // Only include fields that exist in the Product model
    const allowedFields = {
      title: productData.title,
      brand_id: productData.brand_id,
      price: productData.price,
      currency_id: productData.currency_id,
      description: productData.description,
      negotiable: productData.negotiable,
      condition: productData.condition,
      phone_number: productData.phone_number,
      address_id: productData.address_id ? +productData.address_id : undefined,
      category_id: productData.category_id,
      age_range: productData.age_range,
      material: productData.material,
      color: productData.color,
      size: productData.size,
      manufacturer: productData.manufacturer,
      safety_info: productData.safety_info,
      weight: productData.weight,
      dimensions: productData.dimensions
    };

    // Remove undefined values
    const updateData = Object.fromEntries(
      Object.entries(allowedFields).filter(([_, value]) => value !== undefined)
    );

    return this.prisma.product.update({
      where: { id },
      data: updateData,
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

  // Additional methods needed by controller
  async createProductImage(productId: number, image: any) {
    return this.prisma.productImage.create({
      data: {
        product_id: productId,
        url: image.filename || image.path
      }
    });
  }

  async getAllProduct(category?: string) {
    const where: any = { is_deleted: false, is_active: true };
    if (category) {
      where.category = { slug: category };
    }

    return this.prisma.product.findMany({
      where,
      include: {
        product_image: true,
        brand: true,
        category: true,
        user: {
          select: { id: true, first_name: true, last_name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getProductByTitleQuery(search: string) {
    return this.prisma.product.findMany({
      where: {
        AND: [
          { is_deleted: false },
          { is_active: true },
          {
            OR: [
              { title: { contains: search } },
              { description: { contains: search } }
            ]
          }
        ]
      },
      include: {
        product_image: true,
        brand: true,
        category: true
      }
    });
  }

  async getProductByUserId(userId: number) {
    return this.prisma.product.findMany({
      where: {
        user_id: userId,
        is_deleted: false
      },
      include: {
        product_image: true,
        brand: true,
        category: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getPendingProducts() {
    return this.prisma.product.findMany({
      where: {
        is_checked: 'PENDING',
        is_deleted: false
      },
      include: {
        product_image: true,
        brand: true,
        category: true,
        user: {
          select: { id: true, first_name: true, last_name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async approvProduct(productId: number) {
    return this.prisma.product.update({
      where: { id: productId },
      data: {
        is_checked: 'APPROVED',
        is_active: true
      }
    });
  }

  async rejectProduct(productId: number) {
    return this.prisma.product.update({
      where: { id: productId },
      data: {
        is_checked: 'REJECTED',
        is_active: false
      }
    });
  }

  async deleteProductImage(imageId: number) {
    return this.prisma.productImage.delete({
      where: { id: imageId }
    });
  }
}
