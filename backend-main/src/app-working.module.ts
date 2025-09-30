// @ts-nocheck
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CoreModule } from './core/core.module';
import { CategoryModule } from './category/category.module';
import { BrandModule } from './brand/brand.module';
import { ProductModule } from './product/product.module';
import { UserModule } from './user/user.module';
import { SearchIndexingService } from './search/search-indexing.service';
import { CacheStrategyService } from './cache/cache-strategy-simple.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
    CoreModule,
    CategoryModule,
    BrandModule,
    ProductModule,
    UserModule,
  ],
  providers: [
    SearchIndexingService,
    CacheStrategyService,
  ],
})
export class AppModule {}
