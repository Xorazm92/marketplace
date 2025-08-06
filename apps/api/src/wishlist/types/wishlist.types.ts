import { Field, ObjectType, Int, Float } from '@nestjs/graphql';
import { Product } from '../../shared/shared.types';

@ObjectType()
export class WishlistItem {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  wishlist_id: number;

  @Field(() => Int)
  product_id: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Product, { nullable: true })
  product?: Product;
}

@ObjectType()
export class Wishlist {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  user_id: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [WishlistItem])
  items: WishlistItem[];

  @Field(() => Int)
  total_items: number;
}

