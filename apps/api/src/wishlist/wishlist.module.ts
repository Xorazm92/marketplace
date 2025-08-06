import { Module } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistResolver } from './wishlist.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, JwtModule, ConfigModule],
  providers: [WishlistService, WishlistResolver],
  exports: [WishlistService],
})
export class WishlistModule {}
