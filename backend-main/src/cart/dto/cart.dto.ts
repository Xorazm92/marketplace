import { IsInt, IsPositive, Min } from 'class-validator';
export class AddToCartDto {
  @IsInt()
  @IsPositive()
  product_id: number;
  @IsInt()
  @Min(1)
  quantity: number;
}
export class UpdateCartItemDto {
  @IsInt()
  @IsPositive()
  cart_item_id: number;
  @IsInt()
  @Min(1)
  quantity: number;
}
export class RemoveFromCartDto {
  @IsInt()
  @IsPositive()
  cart_item_id: number;
}
