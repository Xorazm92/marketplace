import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
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

@Controller("product")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  
  @ApiOperation({ summary: "Create product image" })
  @ApiBearerAuth("inbola")
  @Post('image/:id')
  @UseGuards(UserGuard, UserProductGuard )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  createProductImage(
    @Param('id') id: number,
    @UploadedFile() image: Express.Multer.File,
  ) {
    console.log("testing");
    
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

      return await this.productService.create(createProductDto, createProductDto.user_id);
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
  findOne(@Param("id") id: number) {
    return this.productService.findOne(+id);
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
  @UseInterceptors(FilesInterceptor('images', 10, multerOptions))
  update(
    @Param("id") id: number, 
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() images?: Express.Multer.File[]
  ) {
    return this.productService.update(+id, updateProductDto, images);
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
