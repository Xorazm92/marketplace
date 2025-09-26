import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsPositive, IsUUID } from 'class-validator';

@InputType()
export class AddToWishlistDto {
  @Field()
  @IsUUID()
  product_id: string;
}

@InputType()
export class RemoveFromWishlistDto {
  @Field()
  @IsUUID()
  product_id: string;
}
