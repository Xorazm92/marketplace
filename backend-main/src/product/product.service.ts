import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { isChecked } from "@prisma/client";
import { Express } from "express";
import slugify from "slugify";

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) { }
  async create(createProductDto: CreateProductDto, files: any) {

    try {

      // Check if user exists, if not create a default admin user
      let userId = createProductDto.user_id ? +createProductDto.user_id : null;
      if (userId) {
        const userExists = await this.prisma.user.findUnique({
          where: { id: userId }
        });
        if (!userExists) {
          // Create default admin user for development
          const defaultUser = await this.prisma.user.create({
            data: {
              first_name: "Admin",
              last_name: "User",
              password: "admin123", // In production, this should be hashed
              is_active: true
            }
          });
          userId = defaultUser.id;
        }
      }

      const newProduct = await this.prisma.product.create({
        data: {
          title: createProductDto.title,
          user: userId ? { connect: { id: userId } } : undefined,
          brand: { connect: { id: +createProductDto.brand_id } },
          currency: { connect: { id: +createProductDto.currency_id } },
          category: createProductDto.category_id ? { connect: { id: +createProductDto.category_id } } : undefined,
          address: +createProductDto.address_id ? { connect: { id: +createProductDto.address_id } } : undefined,
          price: createProductDto.price,
          description: createProductDto.description,
          negotiable: createProductDto.negotiable,
          condition: createProductDto.condition,
          phone_number: createProductDto.phone_number,
          age_range: createProductDto.age_range,
          material: createProductDto.material,
          color: createProductDto.color,
          size: createProductDto.size,
          manufacturer: createProductDto.manufacturer,
          safety_info: createProductDto.safety_info,
          features: createProductDto.features || [],
          weight: createProductDto.weight,
          dimensions: createProductDto.dimensions,
          is_deleted: false
        },
        include: {
          user: true,
          brand: true,
          currency: true,
          category: true,
          address: true
        }
      });
      const slug = slugify(`${newProduct.title} ${newProduct.id}`, {
        lower: true,
        replacement: "-",
      });
      const updatedProduct = await this.prisma.product.update({
        where: { id: newProduct.id },
        data: { slug },
        include: {
          product_image: true,
          user: true,
          brand: true,
          currency: true,
          category: true,
          address: true,
        },
      });

      const imagePaths =
        files?.images?.map((img: Express.Multer.File) => ({
          image: img.path.split("public/")[1],
        })) || [];
      console.log(imagePaths);

      if (!imagePaths.length) {
        throw new BadRequestException("No images uploaded");
      }

      const newProductImages = await this.prisma.productImage.createMany({
        data: imagePaths.map((path: any) => ({
          product_id: updatedProduct.id,
          url: path.image,
        })),
      });

      return { product: updatedProduct, productImages: newProductImages };
    } catch (error) {
      console.log(error);
      
      throw error;
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search: string,
    color: string,
    memory: string,
    othermodel: string,
    brand: string,
    region: string,
    condition: boolean
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      is_deleted: false,
      ...(search && { title: { contains: search, mode: "insensitive" } }),
      ...(color && { color: { name: color } }),
      ...(othermodel && { other_model: othermodel }),
      ...(memory && !isNaN(Number(memory)) && { ram: Number(memory) }),
      ...(brand && { brand: { name: brand } }),
      ...(region && { address: { region: { name: region } } }),
      ...(typeof condition === "boolean" && { condition }),
    };

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        skip,
        take: limit,
        where,
        include: {
          user: true,
          brand: true,
          
          
          currency: true,
          address: true,
          product_image: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async getProductBySlug(slug: string) {
    return await this.prisma.product.findUnique({
      where: { slug, is_deleted: false },
      include: {
        user: true,
        brand: true,
        
        
        currency: true,
        address: true,
        product_image: true,
      },
    });
  }

  async getProductByUserId(userId: number) {
    return await this.prisma.product.findMany({
      where: {
        user_id: userId,
        is_checked: isChecked.APPROVED,
        is_deleted: false,
      },
      include: {
        user: true,
        brand: true,
        
        
        currency: true,
        address: true,
        product_image: true,
      },
    });
  }

  async getPendingProducts() {
    return await this.prisma.product.findMany({
      where: { is_checked: isChecked.PENDING, is_deleted: false },
      include: {
        user: true,
        brand: true,
        
        
        currency: true,
        address: true,
        product_image: true,
      },
    });
  }

  async approvProduct(id: number) {
    return await this.prisma.product.update({
      where: { id, is_deleted: false },
      data: { is_checked: isChecked.APPROVED },
    });
  }

  async rejectProduct(id: number) {
    return await this.prisma.product.update({
      where: { id, is_deleted: false },
      data: { is_checked: isChecked.REJECTED },
    });
  }

  async findOne(id: number) {
    return await this.prisma.product.findUnique({
      where: { id, is_deleted: false },
      include: {
        user: true,
        brand: true,
        
        
        currency: true,
        address: true,
        product_image: true,
      },
    });
  }

  async getAllProduct(category?: string) {
    const where: any = {
      is_active: true,
      is_deleted: false
    };

    // Add category filter if provided
    if (category) {
      where.category = {
        slug: category
      };
    }

    return await this.prisma.product.findMany({
      where,
      include: {
        product_image: true,
        brand: true,
        
        currency: true,
        
        category: true
      }
    })
  }

  async getProductByTitleQuery(query: string) {
    console.log(query);
    return await this.prisma.product.findMany({
      where: {
        title: { contains: query, mode: "insensitive" },
        is_deleted: false,
      },
      include: {
        user: true,
        brand: true,
        
        
        currency: true,
        address: true,
        product_image: true,
      },
    });
  }

  async createProductImage(id: number, image: Express.Multer.File) {
    console.log("testing");
    
    return await this.prisma.productImage.create({
      data: {
        product_id: id,
        url: image.path.split("public/")[1],
      },
    });
  }

  async deleteProductImage(id: number) {
    console.log("hiiiiiiiii");
    
    return await this.prisma.productImage.delete({
      where: { id },
    });
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try{
      console.log(updateProductDto);
      
      const data = {
        ...updateProductDto,
        address_id: +updateProductDto.address_id 
      };
      for (const key in data) {
        if (data[key] === undefined || data[key] == 0 ) {
          delete data[key];
        }
      }
      return await this.prisma.product.update({
        where: {id},
        data,
      });
    }catch(e){
      console.log(e);
      throw new Error(e.message)
    }
  }

  async remove(id: number) {
    await this.prisma.product.update({
      where: { id, is_deleted: false },
      data: { is_deleted: true },
    });
    return { message: "Product deleted successfully" };
  }
}
