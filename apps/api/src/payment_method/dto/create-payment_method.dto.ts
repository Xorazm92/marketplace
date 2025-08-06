import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, Length } from "class-validator";

export class CreatePaymentMethodDto {
  @ApiProperty({
    description: 'Payment method name',
    example: 'Card  ',
  })
  @Transform(({ value }) => value.trim())
  @IsString({ message: 'Name must be a string' })
  @Length(2, 50, { message: 'Name must be between 2 and 50 characters' })
  @IsNotEmpty({ message: 'Name must not be empty' })
  name: string;
}
