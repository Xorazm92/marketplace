import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsPositive } from 'class-validator';

@InputType()
export class AddToWishlistDto {
  @Field(() => Int)
  @IsInt()
  @IsPositive()
  product_id: number;
}

@InputType()
export class RemoveFromWishlistDto {
  @Field(() => Int)
  @IsInt()
  @IsPositive()
  product_id: number;
}
