import { Module } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';

// Controller ilgari ro'yxatdan o'tmagan edi — sevimlilar REST API umuman ishlamagan.
@Module({
  controllers: [WishlistController],
  providers: [WishlistService],
})
export class WishlistModule {}
