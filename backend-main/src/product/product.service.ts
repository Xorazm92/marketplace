// @ts-nocheck
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto, userId?: number) {
    const {
      title,
      brand_id,
      price,
      currency_id,
      description,
      negotiable,
      condition,
      phone_number,
      category_id,
      subcategory_id,
      address_id,
      ...otherData
    } = createProductDto;

    const product = await // @ts-ignore
    this.prisma.product.create({
      data: {
        title,
        brand_id: Number(brand_id),
        price: Number(price),
        currency_id: Number(currency_id),
        description,
        negotiable: Boolean(negotiable),
        condition: condition || 'new',
        phone_number,
        category_id: Number(category_id),
        subcategory_id: subcategory_id ? Number(subcategory_id) : undefined,
        address_id: address_id ? Number(address_id) : undefined,
        user_id: userId || 1,
        is_checked: 'PENDING',
        is_active: true,
        is_deleted: false,
        view_count: 0,
        ...otherData
      },
      include: {
        brand: true,
        category: true,
        currency: true,
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true
          }
        },
        product_image: true,
        product_colors: true
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
    sortOrder?: 'asc' | 'desc',
    subcategory_id?: number
  ) {
    const skip = (page - 1) * limit;
    
    const where: any = {
      is_deleted: false,
      is_active: true,
      is_checked: 'APPROVED'
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.category = { slug: category };
    }

    if (brand) {
      where.brand = { name: brand };
    }

    if (minPrice !== undefined) {
      where.price = { ...where.price, gte: minPrice };
    }

    if (maxPrice !== undefined) {
      where.price = { ...where.price, lte: maxPrice };
    }

    if (subcategory_id) {
      where.subcategory_id = subcategory_id;
    }

    const [products, total] = await Promise.all([
    this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          brand: true,
          category: true,
          currency: true,
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true
            }
          },
          product_image: true,
          product_colors: true
        },
        orderBy: { [sortBy || 'createdAt']: sortOrder || 'desc' }
      }),
    this.prisma.product.count({ where })
    ]);

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: string) {
    const product = await // @ts-ignore
    this.prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        brand: true,
        category: true,
        currency: true,
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true
          }
        },
        product_image: true,
        product_colors: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                first_name: true,
                last_name: true
              }
            }
          }
        }
      }
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await // @ts-ignore
    this.prisma.product.update({
      where: { id: parseInt(id) },
      data: { view_count: { increment: 1 } }
    });

    return product;
  }

  async findBySlug(slug: string) {
    const product = await // @ts-ignore
    this.prisma.product.findFirst({
      where: { slug, is_deleted: false },
      include: {
        brand: true,
        category: true,
        currency: true,
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true
          }
        },
        product_image: true,
        product_colors: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                first_name: true,
                last_name: true
              }
            }
          }
        }
      }
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await // @ts-ignore
    this.prisma.product.update({
      where: { id: product.id },
      data: { view_count: { increment: 1 } }
    });

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await // @ts-ignore
    this.prisma.product.update({
      where: { id: parseInt(id) },
      data: updateProductDto,
      include: {
        brand: true,
        category: true,
        currency: true,
        product_image: true,
        product_colors: true
      }
    });

    return product;
  }

  async remove(id: string) {
    return // @ts-ignore
    this.prisma.product.update({
      where: { id: parseInt(id) },
      data: { is_deleted: true, is_active: false }
    });
  }

  async createProductImage(productId: string, url: string) {
    return // @ts-ignore
    this.prisma.productImage.create({
      data: {
        product_id: parseInt(productId),
        url,
        is_primary: false
      }
    });
  }

  async deleteProductImage(imageId: string) {
    return // @ts-ignore
    this.prisma.productImage.delete({
      where: { id: parseInt(imageId) }
    });
  }

  async getPendingProducts() {
    return // @ts-ignore
    this.prisma.product.findMany({
      where: {
        is_checked: 'PENDING',
        is_deleted: false
      }
    });
  }

  async getAllProduct(category?: string) {
    return this.findAll(1, 100, undefined, category);
  }
}
