import { IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Field, InputType, Int, Float } from '@nestjs/graphql';

@InputType()
export class OrderItemInput {
  @Field(() => Int)
  @IsNumber()
  @IsNotEmpty()
  product_id: number;

  @Field(() => Int)
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @Field(() => Float)
  @IsNumber()
  @IsNotEmpty()
  unit_price: number;
}

@InputType()
export class CreateOrderInput {
  @Field(() => Int)
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @Field(() => [OrderItemInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInput)
  items: OrderItemInput[];

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  shipping_address_id?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  billing_address_id?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  payment_method?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => Int)
  @IsNumber()
  @IsNotEmpty()
  currency_id: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  discount_amount?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  tax_amount?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  shipping_amount?: number;
}

export class CreateOrderDto {
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInput)
  items: OrderItemInput[];

  @IsOptional()
  @IsNumber()
  shipping_address_id?: number;

  @IsOptional()
  @IsNumber()
  billing_address_id?: number;

  @IsOptional()
  @IsString()
  payment_method?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsNumber()
  @IsNotEmpty()
  currency_id: number;

  @IsOptional()
  @IsNumber()
  discount_amount?: number;

  @IsOptional()
  @IsNumber()
  tax_amount?: number;

  @IsOptional()
  @IsNumber()
  shipping_amount?: number;
}
