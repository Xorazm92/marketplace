import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Query,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ProductEnhancedService, Product } from './product-enhanced.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('Products Enhanced')
@Controller('product')
export class ProductEnhancedController {
  constructor(private readonly productService: ProductEnhancedService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new product with images' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Product title' },
        brand_id: { type: 'number', description: 'Brand ID' },
        price: { type: 'number', description: 'Product price' },
        currency_id: { type: 'number', description: 'Currency ID' },
        description: { type: 'string', description: 'Product description' },
        negotiable: { type: 'boolean', description: 'Is price negotiable' },
        condition: { type: 'boolean', description: 'Product condition (true=new, false=used)' },
        phone_number: { type: 'string', description: 'Contact phone number' },
        category_id: { type: 'number', description: 'Category ID' },
        subcategory_id: { type: 'number', description: 'Subcategory ID (optional)' },
        age_range: { type: 'string', description: 'Age range (optional)' },
        material: { type: 'string', description: 'Material (optional)' },
        color: { type: 'string', description: 'Color (optional)' },
        size: { type: 'string', description: 'Size (optional)' },
        manufacturer: { type: 'string', description: 'Manufacturer (optional)' },
        safety_info: { type: 'string', description: 'Safety information (optional)' },
        features: { type: 'array', items: { type: 'string' }, description: 'Features list (optional)' },
        weight: { type: 'number', description: 'Weight in kg (optional)' },
        dimensions: { type: 'string', description: 'Dimensions JSON string (optional)' },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Product images'
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('images', 10))
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[]
  ): Promise<{ success: boolean; message: string; data?: Product; error?: any }> {
    console.log('=== PRODUCT CREATE REQUEST ===');
    console.log('Request body:', JSON.stringify(createProductDto, null, 2));
    console.log('Files count:', files?.length || 0);
    
    try {
      // Validate that at least one image is provided
      if (!files || files.length === 0) {
        const errorMsg = 'At least one product image is required';
        console.error(errorMsg);
        throw new BadRequestException(errorMsg);
      }
      
      console.log('All required fields present, proceeding with product creation...');
      
      const product = await this.productService.create(createProductDto, files);
      
      console.log('Product created successfully:', product.id);
      
      return {
        success: true,
        message: 'Product created successfully',
        data: product
      };
    } catch (error) {
      console.error('Error creating product:', error);
      
      // Return more detailed error information
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
  @ApiOperation({ summary: 'Get all products with filters' })
  @ApiQuery({ name: 'category_id', required: false, type: Number })
  @ApiQuery({ name: 'subcategory_id', required: false, type: Number })
  @ApiQuery({ name: 'is_active', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'min_price', required: false, type: Number })
  @ApiQuery({ name: 'max_price', required: false, type: Number })
  async findAll(
    @Query('category_id') categoryId?: number,
    @Query('subcategory_id') subcategoryId?: number,
    @Query('is_active') isActive?: boolean,
    @Query('search') search?: string,
    @Query('min_price') minPrice?: number,
    @Query('max_price') maxPrice?: number,
  ) {
    const filters = {
      category_id: categoryId ? +categoryId : undefined,
      subcategory_id: subcategoryId ? +subcategoryId : undefined,
      is_active: isActive !== undefined ? isActive === true : undefined,
      search,
      min_price: minPrice ? +minPrice : undefined,
      max_price: maxPrice ? +maxPrice : undefined,
    };

    const products = await this.productService.findAll(filters);
    
    return {
      success: true,
      data: products,
      count: products.length
    };
  }

  @Get('active')
  @ApiOperation({ summary: 'Get only active products' })
  async findActive(): Promise<{ success: boolean; data: Product[]; count: number }> {
    const products = await this.productService.findAll({ is_active: true });
    
    return {
      success: true,
      data: products,
      count: products.length
    };
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get products pending approval' })
  async findPending(): Promise<{ success: boolean; data: Product[]; count: number }> {
    const allProducts = await this.productService.findAll();
    const pendingProducts = allProducts.filter(p => p.is_checked === false);
    
    return {
      success: true,
      data: pendingProducts,
      count: pendingProducts.length
    };
  }

  @Get('by-category/:categoryId')
  @ApiOperation({ summary: 'Get products by category' })
  async findByCategory(@Param('categoryId', ParseIntPipe) categoryId: number): Promise<{ success: boolean; data: Product[]; count: number }> {
    const products = await this.productService.findAll({ 
      category_id: categoryId,
      is_active: true 
    });
    
    return {
      success: true,
      data: products,
      count: products.length
    };
  }

  @Get('by-subcategory/:subcategoryId')
  @ApiOperation({ summary: 'Get products by subcategory' })
  async findBySubcategory(@Param('subcategoryId', ParseIntPipe) subcategoryId: number): Promise<{ success: boolean; data: Product[]; count: number }> {
    const products = await this.productService.findAll({ 
      subcategory_id: subcategoryId,
      is_active: true 
    });
    
    return {
      success: true,
      data: products,
      count: products.length
    };
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get product by slug' })
  async findBySlug(@Param('slug') slug: string): Promise<{ success: boolean; data: Product }> {
    const product = await this.productService.findBySlug(slug);
    
    return {
      success: true,
      data: product
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean; data: Product }> {
    const product = await this.productService.findOne(id);
    
    return {
      success: true,
      data: product
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 10))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() files?: Express.Multer.File[]
  ): Promise<{ success: boolean; message: string; data: Product }> {
    const product = await this.productService.update(id, updateProductDto, files);
    
    return {
      success: true,
      message: 'Product updated successfully',
      data: product
    };
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve product (Admin only)' })
  async approve(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean; message: string; data: Product }> {
    const product = await this.productService.approve(id);
    
    return {
      success: true,
      message: 'Product approved successfully',
      data: product
    };
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject product (Admin only)' })
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason?: string
  ): Promise<{ success: boolean; message: string; data: Product }> {
    const product = await this.productService.reject(id, reason);
    
    return {
      success: true,
      message: 'Product rejected',
      data: product
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product (soft delete)' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean; message: string }> {
    const result = await this.productService.remove(id);
    
    return {
      success: true,
      message: result.message
    };
  }
}
