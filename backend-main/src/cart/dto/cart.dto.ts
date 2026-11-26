import { IsInt, IsPositive, Max, Min } from 'class-validator';

// Buyurtmadagi chegara bilan bir xil (OrderItemInput). Chegarasiz son int32 dan oshib,
// bazada 500 xato berardi.
const MAX_QUANTITY = 999;

export class AddToCartDto {
  @IsInt()
  @IsPositive()
  product_id: number;
  @IsInt()
  @Min(1)
  @Max(MAX_QUANTITY)
  quantity: number;
}
export class UpdateCartItemDto {
  @IsInt()
  @IsPositive()
  cart_item_id: number;
  @IsInt()
  @Min(1)
  @Max(MAX_QUANTITY)
  quantity: number;
}
export class RemoveFromCartDto {
  @IsInt()
  @IsPositive()
  cart_item_id: number;
}
