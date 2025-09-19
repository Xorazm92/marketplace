import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductEnhancedController } from './product-enhanced.controller';
import { ProductEnhancedService } from './product-enhanced.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CategoryModule } from '../category/category.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [PrismaModule, CategoryModule, UploadModule],
  controllers: [ProductEnhancedController], // ProductController vaqtincha o'chirildi
  providers: [ProductService, ProductEnhancedService],
})
export class ProductModule {}
