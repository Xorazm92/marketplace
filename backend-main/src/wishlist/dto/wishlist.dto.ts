import { IsInt, IsPositive } from 'class-validator';
export class AddToWishlistDto {
  @IsInt()
  @IsPositive()
  product_id: number;
}
export class RemoveFromWishlistDto {
  @IsInt()
  @IsPositive()
  product_id: number;
}
