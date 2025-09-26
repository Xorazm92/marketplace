import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsPositive, Min, IsUUID } from 'class-validator';

@InputType()
export class AddToCartDto {
  @Field()
  @IsUUID()
  product_id: string;

  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

@InputType()
export class UpdateCartItemDto {
  @Field(() => Int)
  @IsInt()
  @IsPositive()
  cart_item_id: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  quantity: number;
}

@InputType()
export class RemoveFromCartDto {
  @Field(() => Int)
  @IsInt()
  @IsPositive()
  cart_item_id: number;
}
