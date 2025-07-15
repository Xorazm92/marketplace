import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartResolver } from './cart.resolver';
import { CartController } from './cart.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { OptionalUserGuard } from '../common/guards/optional-user.guard';

@Module({
  imports: [PrismaModule, JwtModule, ConfigModule],
  controllers: [CartController],
  providers: [CartService, CartResolver, OptionalUserGuard],
  exports: [CartService],
})
export class CartModule {}
