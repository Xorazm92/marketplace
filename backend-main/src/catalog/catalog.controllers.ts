import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, PartialType } from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin.guard';
import { AllowModerator } from '../guards/allow-moderator.decorator';
import { CurrentAdminRole } from '../decorators/current-admin-role.decorator';
import { multerOptions } from '../config/multer.config';
import { ProductsService } from './products.service';
import { AdminListProductsQuery, ListProductsQuery, SetStockDto, UpsertProductDto } from './dto';

class UpdateProductDto extends PartialType(UpsertProductDto) {}

@ApiTags('Catalog')
@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  list(@Query() query: ListProductsQuery) {
    return this.products.listPublic(query);
  }

  @Get(':idOrSlug')
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.products.findPublic(idOrSlug);
  }
}

@ApiTags('Admin catalog')
@ApiBearerAuth()
@Controller('admin/products')
@UseGuards(AdminGuard)
export class AdminProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  @AllowModerator()
  list(@Query() query: AdminListProductsQuery) {
    return this.products.listAdmin(query);
  }

  @Get(':id')
  @AllowModerator()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.products.findAdmin(id);
  }

  @Post()
  create(@Body() dto: UpsertProductDto) {
    return this.products.create(dto);
  }

  // Moderator kontentni tahrirlaydi; narx maydonlari unga yopiq (ProductsService.update).
  @Patch(':id')
  @AllowModerator()
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto, @CurrentAdminRole() role: string) {
    return this.products.update(id, dto, role);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.products.remove(id);
  }

  @Post(':id/images')
  @AllowModerator()
  @UseInterceptors(FilesInterceptor('images', 10, multerOptions))
  addImages(@Param('id', ParseIntPipe) id: number, @UploadedFiles() files: Express.Multer.File[]) {
    return this.products.addImages(id, files);
  }

  @Delete(':id/images/:imageId')
  @AllowModerator()
  removeImage(@Param('id', ParseIntPipe) id: number, @Param('imageId', ParseIntPipe) imageId: number) {
    return this.products.removeImage(id, imageId);
  }

  @Put(':id/stock')
  setStock(@Param('id', ParseIntPipe) id: number, @Body() dto: SetStockDto) {
    return this.products.setStock(id, dto);
  }
}
