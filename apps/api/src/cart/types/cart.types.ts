import { Field, ObjectType, Int, Float } from '@nestjs/graphql';
import { Product } from '../../shared/shared.types';

@ObjectType()
export class CartItem {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  cart_id: number;

  @Field(() => Int)
  product_id: number;

  @Field(() => Int)
  quantity: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => require('../../shared/shared.types').Product, { nullable: true })
  product?: Product;
}

@ObjectType()
export class Cart {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  user_id: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [CartItem])
  items: CartItem[];

  @Field(() => Float)
  total_amount: number;

  @Field(() => Int)
  total_items: number;
}

