
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
        is_checked: 'APPROVED',
        is_active: true,
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

  // Product'ga image'lar qo'shish
  async addProductImages(productId: number, imageFiles: any[]) {
    try {
      console.log(`🖼️ Adding ${imageFiles.length} images to product ${productId}`);
      console.log('📁 Image files:', imageFiles.map(f => ({ filename: f.filename, path: f.path })));

      const imagePromises = imageFiles.map(async (file, index) => {
        // Image URL'ni yaratish (backend'dan serve qilinadi)
        const imageUrl = `/uploads/${file.filename}`;

        console.log(`📸 Creating image record ${index + 1}: ${imageUrl}`);

        const imageRecord = await this.prisma.productImage.create({
          data: {
            product_id: productId,
            url: imageUrl
          }
        });

        console.log(`✅ Image record created:`, imageRecord);
        return imageRecord;
      });

      const images = await Promise.all(imagePromises);
      console.log(`🎉 Successfully created ${images.length} image records for product ${productId}`);

      return images;
    } catch (error) {
      console.error(`❌ Error adding images to product ${productId}:`, error);
      throw error;
    }
  }

  // Admin uchun barcha product'larni ko'rish (status filter'siz)
  async findAllForAdmin(
    page: number = 1,
    limit: number = 20,
    search?: string,
    status?: string
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      is_deleted: false
    };

    // Status filter (agar berilgan bo'lsa)
    if (status) {
      where.is_checked = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
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
        },
        orderBy: { createdAt: 'desc' }
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
      is_checked: 'APPROVED',
      is_deleted: false
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
          product_colors: {
            include: {
              color: true
            }
          },
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

      // Transform colors data
      const colors = product.product_colors?.map(pc => ({
        id: pc.color.id,
        name: pc.color.name,
        hex: pc.color.hex || this.getColorHex(pc.color.name)
      })) || [];

      return {
        ...product,
        colors
      };
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
    const where: any = { 
      is_deleted: false, 
      is_active: true,
      is_checked: 'APPROVED'
    };
    
    if (category) {
      where.category = { slug: category };
    }

    const products = await this.prisma.product.findMany({
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

    // Transform products to match frontend expectations
    return products.map(product => {
      const price = parseFloat(product.price.toString()) || 0;
      const originalPrice = parseFloat((product.original_price?.toString() || '0')) || price * 1.2;
      
      return {
        ...product,
        images: product.product_image?.map(img => img.url) || [],
        rating: 4.5,
        review_count: Math.floor(Math.random() * 100) + 1,
        seller_name: product.user?.first_name || 'INBOLA',
        original_price: originalPrice,
        discount_percentage: originalPrice > price ? 
          Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
        is_bestseller: Math.random() > 0.7,
        is_featured: Math.random() > 0.8,
        safety_certified: true,
        educational_value: product.educational_value || 'Bolalar rivojlanishi uchun',
        shipping_info: 'Bepul yetkazib berish'
      };
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
      },
      include: {
        product_image: true,
        brand: true,
        category: true,
        user: {
          select: { id: true, first_name: true, last_name: true, profile_img: true }
        }
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

  private getColorHex(colorName: string): string {
    const colorMap: { [key: string]: string } = {
      'Ko\'k': '#0066cc',
      'Qizil': '#cc0000',
      'Yashil': '#00cc00',
      'Sariq': '#ffcc00',
      'Qora': '#000000',
      'Oq': '#ffffff',
      'Kulrang': '#808080',
      'Pushti': '#ffc0cb',
      'Binafsha': '#800080',
      'To\'q sariq': '#ff8c00',
      'Moviy': '#0000ff',
      'Qizg\'ish': '#ff4500',
      'Oltin': '#ffd700',
      'Kumush': '#c0c0c0',
      'Bronza': '#cd7f32'
    };

    return colorMap[colorName] || '#cccccc';
  }
}
