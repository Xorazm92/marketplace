import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { AdminProductsController, ProductsController } from './catalog.controllers';

@Module({
  controllers: [ProductsController, AdminProductsController],
  providers: [ProductsService],
})
export class CatalogModule {}
