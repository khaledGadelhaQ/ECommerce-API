import { IsMongoId, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CartProductDTO {
  @IsMongoId()
  @IsNotEmpty({ message: 'Product ID is required' })
  productID: string;

  @IsNumber()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}
