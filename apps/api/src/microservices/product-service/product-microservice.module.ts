
import { Module } from '@nestjs/common';
import { ProductService } from '../../product/product.service';
import { ProductController } from '../../product/product.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    PrismaModule,
    CacheModule.register({
      ttl: 300, // 5 minutes
      max: 100,
    }),
    RedisModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductMicroserviceModule {}
