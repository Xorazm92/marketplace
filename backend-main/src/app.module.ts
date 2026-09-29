import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { validationSchema } from './config/environment.config';
import { PrismaModule } from './prisma/prisma.module';
import { IdentityModule } from './identity/identity.module';
import { CatalogModule } from './catalog/catalog.module';
import { CategoryModule } from './category/category.module';
import { BrandModule } from './brand/brand.module';
import { CartModule } from './cart/cart.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { RegionModule } from './region/region.module';
import { DistrictModule } from './district/district.module';
import { AccountModule } from './account/addresses';
import { OrderModule } from './order/order.module';
import { PaymentsModule } from './payments/payments.module';
import { ReviewModule } from './review/review.module';
import { BackofficeModule } from './backoffice/backoffice';
import { HealthModule } from './health/health.module';

// MVP qamrovi (docs/plan/MVP_ROADMAP.md). Qolgan modullar kodda turibdi, lekin
// ulanmagan — ro'yxat va sabablari: docs/ICEBOX.md.
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema }),
    // Bitta jarayon uchun xotirada. pm2 cluster yoki bir necha instansiyada
    // Redis storage kerak bo'ladi (docs/DEPLOYMENT.md).
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ttl: 60_000, limit: 300 }],
      skipIf: () => process.env.NODE_ENV === 'test',
    }),
    PrismaModule,
    IdentityModule,
    CatalogModule,
    CategoryModule,
    BrandModule,
    CartModule,
    WishlistModule,
    RegionModule,
    DistrictModule,
    AccountModule,
    OrderModule,
    PaymentsModule,
    ReviewModule,
    BackofficeModule,
    HealthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
