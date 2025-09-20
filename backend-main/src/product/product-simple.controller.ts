import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { UploadService } from '../upload/upload.service';
import { CreateProductDto } from './dto/create-product.dto';

@ApiTags('Products Simple')
@Controller('product')
export class ProductSimpleController {
  constructor(
    private readonly productService: ProductService,
    private readonly uploadService: UploadService
  ) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new product with images' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 10))
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[]
  ): Promise<{ success: boolean; message: string; data?: any; error?: any }> {
    console.log('=== SIMPLE PRODUCT CREATE ===');
    console.log('Request body:', JSON.stringify(createProductDto, null, 2));
    console.log('Files count:', files?.length || 0);
    
    try {
      // Validate that at least one image is provided
      if (!files || files.length === 0) {
        const errorMsg = 'At least one product image is required';
        console.error(errorMsg);
        throw new BadRequestException(errorMsg);
      }
      
      // Upload images first
      const imageUrls = await this.uploadService.uploadProductImages(files);
      console.log('Images uploaded:', imageUrls);
      
      // Create product with uploaded image URLs
      const productData = {
        ...createProductDto,
        images: imageUrls
      };
      
      console.log('Creating product with data:', productData);
      const product = await this.productService.create(productData);
      
      console.log('✅ Product created successfully in DATABASE:', product.id);
      
      return {
        success: true,
        message: 'Product created successfully in database',
        data: product
      };
    } catch (error) {
      console.error('❌ Error creating product:', error);
      
      return {
        success: false,
        message: error.response?.message || error.message || 'Failed to create product',
        error: {
          statusCode: error.status || 500,
          error: error.name || 'InternalServerError',
          message: error.message,
          details: error.response || undefined
        }
      };
    }
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all products' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ): Promise<{ success: boolean; data: any; pagination?: any }> {
    console.log('=== GET ALL PRODUCTS ===');
    console.log('Query params:', { page, limit, search });
    
    try {
      const result = await this.productService.findAll(
        page || 1,
        limit || 20,
        search
      );
      
      console.log('✅ Products fetched from database:', result.products?.length || 0);
      
      return {
        success: true,
        data: result.products || [],
        pagination: result.pagination
      };
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      
      return {
        success: false,
        data: [],
        pagination: null
      };
    }
  }
}
