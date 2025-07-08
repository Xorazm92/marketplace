import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery } from '@nestjs/swagger';
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
  // @UseGuards(UserGuard)
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
      return await this.productService.create(createProductDto, files);
    } catch (error) {
      console.log(error);
      
      // Handle Prisma foreign key constraint errors
      if (error.code === "P2003") {
        throw new BadRequestException(
          `Foreign key constraint failed: ${error.meta?.field || "Unknown field"}`
        );
      }
      throw new InternalServerErrorException(
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
      othermodel,
      brand,
      region,
      condition
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
