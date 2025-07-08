import { Field, ObjectType, Int, Float } from '@nestjs/graphql';

// Placeholder User type
@ObjectType()
export class User {
  @Field(() => Int)
  id: number;
  @Field()
  first_name: string;
  @Field()
  last_name: string;
  @Field()
  email: string;
}

// Placeholder Address type
@ObjectType()
export class Address {
  @Field(() => Int)
  id: number;
  @Field()
  street: string;
  @Field()
  city: string;
  @Field()
  country: string;
}

// Placeholder Currency type
@ObjectType()
export class Currency {
  @Field(() => Int)
  id: number;
  @Field()
  code: string;
  @Field()
  symbol: string;
}

@ObjectType()
export class Product {
  @Field(() => Int)
  id: number;

  @Field()
  title: string;

  @Field(() => Float)
  price: number;

  @Field({ nullable: true })
  slug?: string;

  @Field(() => [ProductImage], { nullable: true })
  product_image?: ProductImage[];
}

@ObjectType()
export class ProductImage {
  @Field(() => Int)
  id: number;

  @Field()
  url: string;
}
