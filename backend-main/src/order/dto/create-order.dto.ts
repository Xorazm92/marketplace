import { IsNotEmpty, IsNumber, IsInt, Min, IsOptional, IsString, IsArray, ArrayNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class OrderItemInput {
  @Field(() => Int)
  @IsNumber()
  @IsNotEmpty()
  product_id: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  quantity: number;
}

@InputType()
export class CreateOrderInput {
  @Field(() => Int)
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @Field(() => [OrderItemInput])
  @IsArray()
  @ArrayNotEmpty()
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



}

export class CreateOrderDto {
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @IsArray()
  @ArrayNotEmpty()
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



}
