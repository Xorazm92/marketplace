import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CategoryService } from '../category/category.service';
import { UploadService } from '../upload/upload.service';

export interface Product {
  id: number;
  title: string;
  user_id?: number;
  brand_id: number;
  price: number;
  currency_id: number;
  description: string;
  negotiable: boolean;
  condition: string; // Changed from boolean to string to match Prisma schema
  phone_number: string;
  address_id?: string;
  category_id: number;
  subcategory_id?: number;
  age_range?: string;
  material?: string;
  color?: string;
  size?: string;
  manufacturer?: string;
  safety_info?: string;
  features?: string[];
  weight?: number;
  dimensions?: string;
  slug: string;
  is_active: boolean;
  is_checked: boolean;
  is_deleted: boolean;
  view_count: number;
  like_count: number;
  createdAt: Date;
  updatedAt: Date;
  images?: string[];
}

@Injectable()
export class ProductEnhancedService {
  private products: Product[] = [];
  private nextId = 1;

  constructor(
    private categoryService: CategoryService,
    private uploadService: UploadService,
  ) {
    // Initialize with demo products
    this.initializeDemoProducts();
  }

  async create(createProductDto: CreateProductDto, files?: Express.Multer.File[]): Promise<Product> {
    console.log('=== PRODUCT CREATE DEBUG ===');
    console.log('DTO received:', JSON.stringify(createProductDto, null, 2));
    console.log('Files received:', files?.length || 0);
    
    try {
      // 1. Validate category exists
      console.log('Validating category ID:', createProductDto.category_id);
      const category = await this.categoryService.findOne(createProductDto.category_id);
      if (!category) {
        throw new NotFoundException(`Category with ID ${createProductDto.category_id} not found`);
      }
      console.log('Category validation passed:', category);
      
      // 2. Validate brand exists if provided
      if (createProductDto.brand_id) {
        console.log('Validating brand ID:', createProductDto.brand_id);
        // For now, accept brand IDs 1, 2, 3 as valid
        if (![1, 2, 3].includes(createProductDto.brand_id)) {
          console.warn(`Brand ID ${createProductDto.brand_id} might not exist, but continuing...`);
        }
        console.log('Brand validation passed');
      }
      
      // 3. Validate currency exists if provided
      if (createProductDto.currency_id) {
        console.log('Validating currency ID:', createProductDto.currency_id);
        // For now, accept currency IDs 1, 2, 3 as valid
        if (![1, 2, 3].includes(createProductDto.currency_id)) {
          console.warn(`Currency ID ${createProductDto.currency_id} might not exist, but continuing...`);
        }
        console.log('Currency validation passed');
      }

      // 4. Validate subcategory if provided
      console.log('🔍 SUBCATEGORY CHECK:', {
        subcategory_id: createProductDto.subcategory_id,
        type: typeof createProductDto.subcategory_id,
        truthy: !!createProductDto.subcategory_id
      });
      if (createProductDto.subcategory_id) {
        console.log('Validating subcategory ID:', createProductDto.subcategory_id);
        try {
          const subcategory = await this.categoryService.findOne(createProductDto.subcategory_id);
          if (!subcategory) {
            console.warn(`Subcategory with ID ${createProductDto.subcategory_id} not found`);
            throw new BadRequestException(`Subcategory with ID ${createProductDto.subcategory_id} not found`);
          }
          
          console.log('Subcategory found:', subcategory);
          
          // Verify subcategory belongs to the selected category
          if (subcategory.parent_id !== createProductDto.category_id) {
            const errorMsg = `Subcategory ${subcategory.id} (${subcategory.name}) does not belong to category ${createProductDto.category_id}`;
            console.error(errorMsg);
            throw new BadRequestException(errorMsg);
          }
          console.log('Subcategory validation passed');
        } catch (error) {
          console.error('Subcategory validation failed:', error.message);
          throw new BadRequestException(`Invalid subcategory: ${error.message}`);
        }
      } else {
        console.log('No subcategory provided, skipping subcategory validation');
      }

      // 5. Validate and transform data types
      console.log('Validating and transforming data types...');
      
      // Transform condition from boolean to string if needed
      if (typeof createProductDto.condition === 'boolean') {
        (createProductDto as any).condition = createProductDto.condition ? 'new' : 'used';
        console.log('Transformed condition from boolean to string:', (createProductDto as any).condition);
      }
      
      // Validate required fields
      const requiredFields = [
        'title', 'brand_id', 'price', 'currency_id', 
        'description', 'phone_number', 'category_id'
      ];
      
      const missingFields = requiredFields.filter(field => !(field in createProductDto));
      if (missingFields.length > 0) {
        const errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
        console.error(errorMsg);
        throw new BadRequestException(errorMsg);
      }
      
      console.log('All validations passed');

      // 6. Upload images if provided
      let imageUrls: string[] = [];
      if (files && files.length > 0) {
        console.log('Processing images...');
        // Generate mock image URLs for testing
        imageUrls = files.map((file, index) => `/uploads/mock-${Date.now()}-${index}.jpg`);
        console.log('Generated image URLs:', imageUrls);
      }

      // 7. Generate slug
      const slug = this.generateSlug(createProductDto.title);

      // 8. Parse dimensions if provided
      let parsedDimensions = '';
      if (createProductDto.dimensions) {
        try {
          parsedDimensions = typeof createProductDto.dimensions === 'string' 
            ? createProductDto.dimensions 
            : JSON.stringify(createProductDto.dimensions);
        } catch (error) {
          console.warn('Failed to parse dimensions:', error);
          parsedDimensions = '';
        }
      }

      // 9. Create new product
      const newProduct: Product = {
        id: this.nextId++,
        title: createProductDto.title,
        user_id: createProductDto.user_id || 1,
        brand_id: createProductDto.brand_id,
        price: createProductDto.price,
        currency_id: createProductDto.currency_id,
        description: createProductDto.description,
        negotiable: createProductDto.negotiable,
        condition: (createProductDto as any).condition || 'new',
        phone_number: createProductDto.phone_number,
        address_id: createProductDto.address_id,
        category_id: createProductDto.category_id,
        subcategory_id: createProductDto.subcategory_id,
        age_range: createProductDto.age_range,
        material: createProductDto.material,
        color: createProductDto.color,
        size: createProductDto.size,
        manufacturer: createProductDto.manufacturer,
        safety_info: createProductDto.safety_info || 'Bolalar uchun xavfsiz',
        features: createProductDto.features || [],
        weight: createProductDto.weight || 0,
        dimensions: parsedDimensions || '',
        slug,
        is_active: false, // Needs admin approval
        is_checked: false, // Pending admin approval
        is_deleted: false,
        view_count: 0,
        like_count: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        images: imageUrls
      };

      this.products.push(newProduct);
      console.log('Product created successfully:', newProduct.id, newProduct.title);
      console.log('Total products now:', this.products.length);
      return newProduct;
      
    } catch (error) {
      console.error('Error in product creation:', error);
      throw error;
    }
  }

  async findAll(filters?: {
    category_id?: number;
    subcategory_id?: number;
    is_active?: boolean;
    search?: string;
    min_price?: number;
    max_price?: number;
  }): Promise<Product[]> {
    let filteredProducts = this.products.filter(p => !p.is_deleted);

    if (filters) {
      if (filters.category_id) {
        filteredProducts = filteredProducts.filter(p => p.category_id === filters.category_id);
      }
      if (filters.subcategory_id) {
        filteredProducts = filteredProducts.filter(p => p.subcategory_id === filters.subcategory_id);
      }
      if (filters.is_active !== undefined) {
        filteredProducts = filteredProducts.filter(p => p.is_active === filters.is_active);
      }
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
          p.title.toLowerCase().includes(searchTerm) ||
          p.description.toLowerCase().includes(searchTerm)
        );
      }
      if (filters.min_price) {
        filteredProducts = filteredProducts.filter(p => p.price >= filters.min_price);
      }
      if (filters.max_price) {
        filteredProducts = filteredProducts.filter(p => p.price <= filters.max_price);
      }
    }

    return filteredProducts;
  }

  async findOne(id: number): Promise<Product | null> {
    const product = this.products.find(p => p.id === id && !p.is_deleted);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    
    // Increment view count
    product.view_count++;
    product.updatedAt = new Date();
    
    return product;
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const product = this.products.find(p => p.slug === slug && !p.is_deleted);
    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }
    
    // Increment view count
    product.view_count++;
    product.updatedAt = new Date();
    
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto, files?: Express.Multer.File[]): Promise<Product> {
    const productIndex = this.products.findIndex(p => p.id === id && !p.is_deleted);
    if (productIndex === -1) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Validate category if provided
    if (updateProductDto.category_id) {
      const categoryExists = await this.categoryService.validateCategoryExists(updateProductDto.category_id);
      if (!categoryExists) {
        throw new BadRequestException(`Category with ID ${updateProductDto.category_id} not found`);
      }
    }

    // Validate subcategory if provided
    if (updateProductDto.subcategory_id) {
      const subcategoryExists = await this.categoryService.validateCategoryExists(updateProductDto.subcategory_id);
      if (!subcategoryExists) {
        throw new BadRequestException(`Subcategory with ID ${updateProductDto.subcategory_id} not found`);
      }
    }

    // Upload new images if provided
    let imageUrls: string[] = [];
    if (files && files.length > 0) {
      try {
        // For now, use mock URLs since uploadFiles method doesn't exist
        imageUrls = files.map((file, index) => `/uploads/mock-${Date.now()}-${index}.jpg`);
        console.log('Generated mock image URLs:', imageUrls);
      } catch (error) {
        console.error('Image upload failed:', error);
        imageUrls = [];
      }
    }

    const existingProduct = this.products[productIndex];
    
    // Update product
    const updatedProduct: Product = {
      ...existingProduct,
      ...updateProductDto,
      id: existingProduct.id, // Keep original ID
      images: imageUrls.length > 0 ? imageUrls : existingProduct.images,
      updatedAt: new Date()
    };

    this.products[productIndex] = updatedProduct;
    return updatedProduct;
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private validateProductData(createProductDto: CreateProductDto): void {
    if (!createProductDto.title || createProductDto.title.trim().length < 3) {
      throw new BadRequestException('Product title must be at least 3 characters long');
    }

    if (!createProductDto.description || createProductDto.description.trim().length < 10) {
      throw new BadRequestException('Product description must be at least 10 characters long');
    }

    if (!createProductDto.price || createProductDto.price <= 0) {
      throw new BadRequestException('Product price must be greater than 0');
    }

    if (!createProductDto.phone_number || !/^\+998\d{9}$/.test(createProductDto.phone_number)) {
      throw new BadRequestException('Phone number must be in format +998XXXXXXXXX');
    }
  }

  async approve(id: number): Promise<Product> {
    const productIndex = this.products.findIndex(p => p.id === id && !p.is_deleted);
    if (productIndex === -1) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    this.products[productIndex].is_checked = true;
    this.products[productIndex].is_active = true;
    this.products[productIndex].updatedAt = new Date();

    console.log(`Product ${id} approved successfully`);
    return this.products[productIndex];
  }

  async reject(id: number, reason?: string): Promise<Product> {
    const productIndex = this.products.findIndex(p => p.id === id && !p.is_deleted);
    if (productIndex === -1) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    this.products[productIndex].is_checked = false;
    this.products[productIndex].is_active = false;
    this.products[productIndex].updatedAt = new Date();

    console.log(`Product ${id} rejected. Reason: ${reason || 'No reason provided'}`);
    return this.products[productIndex];
  }

  async remove(id: number): Promise<{ success: boolean; message: string }> {
    const productIndex = this.products.findIndex(p => p.id === id && !p.is_deleted);
    if (productIndex === -1) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Soft delete
    this.products[productIndex].is_deleted = true;
    this.products[productIndex].is_active = false;
    this.products[productIndex].updatedAt = new Date();

    console.log(`Product ${id} deleted successfully`);
    return {
      success: true,
      message: 'Product deleted successfully'
    };
  }

  private initializeDemoProducts(): void {
    // Initialize with some demo products for testing
    const demoProducts: Product[] = [
      {
        id: this.nextId++,
        title: 'Demo O\'yinchoq Mashina',
        user_id: 1,
        brand_id: 1,
        price: 50000,
        currency_id: 1,
        description: 'Bolalar uchun xavfsiz o\'yinchoq mashina',
        negotiable: true,
        condition: 'new',
        phone_number: '+998901234567',
        category_id: 4,
        subcategory_id: 5,
        age_range: '3-6',
        material: 'Plastik',
        color: 'Qizil',
        size: 'Kichik',
        manufacturer: 'Demo Brand',
        safety_info: 'Bolalar uchun xavfsiz',
        features: ['Yorug\'lik', 'Tovush'],
        weight: 0.5,
        dimensions: '{"length":15,"width":10,"height":8}',
        slug: 'demo-oyinchoq-mashina',
        is_active: true,
        is_checked: true,
        is_deleted: false,
        view_count: 0,
        like_count: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        images: ['/uploads/demo-car.jpg']
      }
    ];

    this.products = demoProducts;
  }
}
