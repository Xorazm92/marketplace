import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Product } from '../../shared/shared.types';
import { User } from '../../shared/shared.types';
import { Address } from '../../shared/shared.types';
import { Currency } from '../../shared/shared.types';

@ObjectType()
export class OrderItem {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  order_id: number;

  @Field(() => Int)
  product_id: number;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  unit_price: number;

  @Field(() => Float)
  total_price: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Product, { nullable: true })
  product?: Product;
}

@ObjectType()
export class OrderPayment {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  order_id: number;

  @Field(() => Float)
  amount: number;

  @Field()
  payment_method: string;

  @Field({ nullable: true })
  transaction_id?: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  gateway_response?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class OrderTracking {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  order_id: number;

  @Field()
  status: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  location?: string;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class Order {
  @Field(() => Int)
  id: number;

  @Field()
  order_number: string;

  @Field(() => Int)
  user_id: number;

  @Field(() => Float)
  total_amount: number;

  @Field(() => Float, { nullable: true })
  discount_amount?: number;

  @Field(() => Float, { nullable: true })
  tax_amount?: number;

  @Field(() => Float, { nullable: true })
  shipping_amount?: number;

  @Field(() => Float)
  final_amount: number;

  @Field(() => Int)
  currency_id: number;

  @Field()
  status: string;

  @Field()
  payment_status: string;

  @Field({ nullable: true })
  payment_method?: string;

  @Field(() => Int, { nullable: true })
  shipping_address_id?: number;

  @Field(() => Int, { nullable: true })
  billing_address_id?: number;

  @Field({ nullable: true })
  notes?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Relations
  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => Currency, { nullable: true })
  currency?: Currency;

  @Field(() => Address, { nullable: true })
  shipping_address?: Address;

  @Field(() => Address, { nullable: true })
  billing_address?: Address;

  @Field(() => [OrderItem])
  items: OrderItem[];

  @Field(() => [OrderPayment])
  payments: OrderPayment[];

  @Field(() => [OrderTracking])
  tracking: OrderTracking[];

  // Computed fields
  @Field(() => Int)
  total_items: number;

  @Field(() => Float)
  items_total: number;
}
