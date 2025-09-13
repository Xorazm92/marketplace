import { 
  ApiBearerAuth, 
  ApiBody, 
  ApiConsumes, 
  ApiOperation, 
  ApiQuery, 
  ApiTags, 
  ApiResponse, 
  ApiParam,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse
} from '@nestjs/swagger';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  InternalServerErrorException,
  Put,
  UploadedFile
} from '@nestjs/common'
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { AdminGuard } from "../guards/admin.guard";
import { ProductService } from "./product.service";
import { multerOptions } from "../config/multer.config";
import { UserGuard } from "../guards/user.guard";
import { UserProductGuard } from "../guards/user-product.guard";
import { UserSelfGuard } from "../guards/user-self.guard";

@ApiTags('📦 Products')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  
  @Post('image/:id')
  @ApiOperation({ 
    summary: 'Upload product image',
    description: 'Upload an image for a specific product. Only the product owner or admin can upload images.'
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(UserGuard, UserProductGuard)
  @ApiConsumes('multipart/form-data')
  @ApiParam({ 
    name: 'id', 
    description: 'Product ID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    schema: {
      example: {
        success: true,
        message: 'Image uploaded successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          imageUrl: 'http://localhost:3001/uploads/products/12345-image.jpg',
          productId: '550e8400-e29b-41d4-a716-446655440000',
          createdAt: '2023-01-01T00:00:00.000Z'
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid file type or size',
    schema: {
      example: {
        statusCode: 400,
        message: 'Only image files are allowed',
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized'
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not authorized to upload image for this product',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden'
      }
    }
  })
  @ApiBody({
    description: 'Product image file',
    required: true,
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Image file (JPG, PNG, or WebP, max 5MB)'
        }
      },
      required: ['image']
    }
  })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  async createProductImage(
    @Param('id') id: string,
    @UploadedFile() image: Express.Multer.File
  ) {
    console.log("Uploading image for product:", id);
    return this.productService.createProductImage(+id, image);
  }

  
  @ApiOperation({ summary: "Create new product" })
  @ApiBearerAuth("inbola")
  // @UseGuards(UserGuard) // Temporarily disabled for admin testing
  @Post("create")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "images", maxCount: 10 }], multerOptions)
  )
  async create(
    @UploadedFiles()
    files: {
      images?: Express.Multer.File[];
    },
    @Body() createProductDto: CreateProductDto
  ) {
    try {
      console.log('=== PRODUCT CREATION DEBUG ===');
      console.log('Received product data:', createProductDto);
      console.log('Data types:', {
        title: typeof createProductDto.title,
        price: typeof createProductDto.price,
        currency_id: typeof createProductDto.currency_id,
        category_id: typeof createProductDto.category_id,
        brand_id: typeof createProductDto.brand_id,
        negotiable: typeof createProductDto.negotiable,
        condition: typeof createProductDto.condition
      });
      console.log('Received files:', files);
      console.log('Files count:', files?.images?.length || 0);

      const product = await this.productService.create(createProductDto, createProductDto.user_id);
      console.log('✅ Product created with ID:', product.id);

      // Image'larni product bilan bog'lash
      if (files?.images && files.images.length > 0) {
        console.log('🖼️ Processing images for product:', product.id);
        try {
          const imageResults = await this.productService.addProductImages(product.id, files.images);
          console.log('✅ Images added successfully:', imageResults.length);
        } catch (error) {
          console.error('❌ Error adding images:', error);
        }
      } else {
        console.log('⚠️ No images to process');
      }

      // Product'ni image'lar bilan qayta olish
      const productWithImages = await this.productService.findOne(product.id);
      console.log('📦 Product with images:', {
        id: productWithImages.id,
        title: productWithImages.title,
        imageCount: productWithImages.product_image?.length || 0
      });

      // Return consistent response format
      return {
        success: true,
        message: 'Product created successfully',
        product: productWithImages,
        statusCode: 201
      };
    } catch (error) {
      console.error('=== PRODUCT CREATION ERROR ===');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);

      // Handle validation errors
      if (error.response && error.response.message) {
        throw new BadRequestException(error.response.message);
      }

      // Handle Prisma foreign key constraint errors
      if (error.code === "P2003") {
        throw new BadRequestException(
          `Foreign key constraint failed: ${error.meta?.field || "Unknown field"}`
        );
      }

      // Handle other Prisma errors
      if (error.code) {
        throw new BadRequestException(`Database error: ${error.message}`);
      }

      throw new BadRequestException(
        error.message || "An unexpected error occurred"
      );
    }
  }

  @ApiOperation({ summary: "Get all products for admin (including pending)" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "status", required: false, type: String })
  @Get("admin/all")
  findAllForAdmin(
    @Query("page") page = 1,
    @Query("limit") limit = 20,
    @Query("search") search: string,
    @Query("status") status: string
  ) {
    return this.productService.findAllForAdmin(+page, +limit, search, status);
  }

  @ApiOperation({ summary: "Get all products by query" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "search", required: false, type: String })
  @Get()
  findAll(
    @Query("page") page = 1,
    @Query("limit") limit = 16,
    @Query("search") search: string,
    @Query("color") color: string,
    @Query("memory") memory: string,
    @Query("othermodel") othermodel: string,
    @Query("brand") brand: string,
    @Query("region") region: string,
    @Query("condition") condition: boolean
  ) {
    return this.productService.findAll(
      +page,
      +limit,
      search,
      color,
      memory,
      +othermodel || 0,
      +brand || 0,
      region,
      condition ? 'desc' : 'asc'
    );
  }
  
  @Get("all")
  @ApiOperation({ summary: "Get all products" })
  @ApiQuery({ name: "category", required: false, type: String })
  getAllProducts(@Query("category") category?: string) {
    return this.productService.getAllProduct(category);
  }

  @ApiOperation({ summary: "Get product by title (query param)" })
  @Get("search")
  getProductByTitleQuery(@Query("search") search: string) {
    return this.productService.getProductByTitleQuery(search);
  }

  @ApiOperation({ summary: "Get product by id" })
  @Get(":id")
  findOne(@Param("id") id: string) {
    // Validate that id is numeric to avoid conflicts with /all route
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new BadRequestException('Product ID must be a number');
    }
    return this.productService.findOne(numericId);
  }

  @ApiOperation({ summary: "Get user's products" })
  @Get("user/:id")
  @ApiBearerAuth("inbola")
  @UseGuards(UserSelfGuard)
  @UseGuards(UserGuard)
  getProductByUserId(@Param("id") id: number) {
    return this.productService.getProductByUserId(+id);
  }

  @ApiOperation({ summary: "Get pending products" })
  @ApiBearerAuth("inbola")
  @UseGuards(AdminGuard)
  @Get("pending")
  getPendingProducts() {
    return this.productService.getPendingProducts();
  }

  @ApiOperation({ summary: "Approve product" })
  @ApiBearerAuth("inbola")
  @UseGuards(AdminGuard)
  @Get("approved/:id")
  approveProduct(@Param("id") id: number) {
    return this.productService.approvProduct(+id);
  }

  @ApiOperation({ summary: "Reject product" })
  @ApiBearerAuth("inbola")
  @UseGuards(AdminGuard)
  @Get("rejected/:id")
  rejectProduct(@Param("id") id: number) {
    return this.productService.rejectProduct(+id);
  }

 

  @ApiOperation({ summary: "Update product" })
  @ApiBearerAuth("inbola")
  @UseGuards(UserProductGuard)
  @UseGuards(UserGuard)
  @Put(":id")
  update(@Param("id") id: number, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(+id, updateProductDto);
  }
  

  @ApiOperation({ summary: "Delete product image" })
  @ApiBearerAuth("inbola")
  @UseGuards(UserGuard,UserProductGuard)
  @Delete("/:id/image/:imageId")
  deleteProductImage(@Param("imageId") id: number) {
    console.log();
    return this.productService.deleteProductImage(+id);
  }

  @ApiBearerAuth("inbola")
  @UseGuards(UserProductGuard)
  @UseGuards(UserGuard)
  @ApiOperation({ summary: " Delete product" })
  @Delete(":id")
  remove(@Param("id") id: number) {
    return this.productService.remove(+id);
  }
}
