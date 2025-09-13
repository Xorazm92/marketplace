import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { BrandService } from "./brand.service";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { UpdateBrandDto } from "./dto/update-brand.dto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";
import { AdminGuard } from "../guards/admin.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { multerOptions } from "../config/multer.config";

@ApiTags("Brand")
@Controller("brand")
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  @ApiBearerAuth("inbola")
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: "Create new brand" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        name: { type: "string", example: "Nike" },
        image: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: "Brand created successfully" })
  @UseInterceptors(FileInterceptor("image", multerOptions))
  create(
    @Body() createBrandDto: CreateBrandDto,
    @UploadedFile() image: Express.Multer.File
  ) {
    if (!image) {
      throw new BadRequestException("Image must be uploaded");
    }
    return this.brandService.create(createBrandDto, image);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed default brands' })
  @ApiResponse({ status: 201, description: 'Brands seeded successfully' })
  async seed() {
    try {
      // Check if brands already exist
      const existingBrands = await this.brandService.findAll();
      if (existingBrands.length > 0) {
        return { message: 'Brands already exist' };
      }

      // Create default brands without image requirement
      const defaultBrands = [
        { name: 'INBOLA' },
        { name: 'Fisher-Price' },
        { name: 'LEGO' },
        { name: 'Mattel' },
        { name: 'Hasbro' }
      ];

      for (const brand of defaultBrands) {
        await this.brandService.createWithoutImage(brand);
      }

      return { message: 'Brands seeded successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to seed brands');
    }
  }

  @Get()
  @ApiOperation({ summary: "Get all brands" })
  @ApiResponse({ status: 200, description: "List of all brands" })
  findAll() {
    return this.brandService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get brand by ID" })
  @ApiResponse({ status: 200, description: "Brand found" })
  findOne(@Param("id") id: string) {
    return this.brandService.findOne(+id);
  }

  @Put(":id")
  @ApiBearerAuth("inbola")
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: "Update brand by ID" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        name: { type: "string", example: "Nike" },
        image: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @ApiConsumes("multipart/form-data")
  @ApiResponse({ status: 200, description: "Brand updated successfully" })
  @UseInterceptors(FileInterceptor("image", multerOptions))
  update(
    @Param("id") id: string,
    @Body() updateBrandDto: UpdateBrandDto,
    @UploadedFile() image: Express.Multer.File
  ) {
    return this.brandService.update(+id, updateBrandDto, image);
  }

  @Delete(":id")
  @ApiBearerAuth("inbola")
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: "Delete brand by ID" })
  @ApiResponse({ status: 200, description: "Brand deleted successfully" })
  remove(@Param("id") id: string) {
    return this.brandService.remove(+id);
  }
}
