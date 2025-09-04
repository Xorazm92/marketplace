
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AdminModule } from './admin/admin.module';
import { UserModule } from './user/user.module';
import { UserAuthModule } from './user-auth/user-auth.module';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { BrandModule } from './brand/brand.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { PaymentModule } from './payment/payment.module';
import { PaymentMethodModule } from './payment_method/payment_method.module';
import { RegionModule } from './region/region.module';
import { DistrictModule } from './district/district.module';
import { AddressModule } from './address/address.module';
import { PhoneNumberModule } from './phone_number/phone_number.module';
import { EmailModule } from './email/email.module';
import { ColorsModule } from './colors/colors.module';
import { CurrencyModule } from './currency/currency.module';
import { ModelModule } from './model/model.module';
import { OtpModule } from './otp/otp.module';
import { MailModule } from './mail/mail.module';
import { ChatModule } from './chat/chat.module';
import { NotificationModule } from './notification/notification.module';
import { ReviewModule } from './review/review.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 1000, // 1000 requests per minute (10x ko'paytirildi)
      },
      {
        ttl: 3600000, // 1 hour
        limit: 10000, // 10000 requests per hour (10x ko'paytirildi)
      },
    ]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' },
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      subscriptions: {
        'graphql-ws': true,
        'subscriptions-transport-ws': true,
      },
      context: ({ req, res }) => ({
        req,
        res,
      }),
    }),
    CommonModule,
    PrismaModule,
    AdminModule,
    UserModule,
    UserAuthModule,
    ProductModule,
    CategoryModule,
    BrandModule,
    CartModule,
    OrderModule,
    WishlistModule,
    PaymentModule,
    PaymentMethodModule,
    RegionModule,
    DistrictModule,
    AddressModule,
    PhoneNumberModule,
    EmailModule,
    ColorsModule,
    CurrencyModule,
    ModelModule,
    OtpModule,
    MailModule,
    ChatModule,
    NotificationModule,
    ReviewModule,
    AuthModule,
    HealthModule,
  ],
  providers: [
    // Development da rate limiting o'chirildi
    ...(process.env.NODE_ENV === 'production'
      ? [{ provide: APP_GUARD, useClass: ThrottlerGuard }]
      : []),
  ],
})
export class AppModule {}