import {
  IsString,
  IsOptional,
  IsNumber,
  IsPositive,
  Min,
  Max,
  IsArray,
  IsUrl,
  IsMongoId,
} from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsPositive({ message: 'Quantity must be a positive number.' })
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @Min(0, { message: 'Sold must be at least 0.' })
  @IsOptional()
  sold?: number;

  @IsNumber()
  @IsPositive({ message: 'Price must be a positive number.' })
  @IsOptional()
  price?: number;

  @IsNumber()
  @Min(0, { message: 'Discounted price must be at least 0.' })
  @Max(99999, { message: 'Discounted price must be less than 99999.' })
  @IsOptional()
  priceAfterDiscount?: number;

  @IsArray()
  @IsOptional()
  colors?: string[];

  @IsUrl({}, { message: 'Image cover must be a valid URL.' })
  @IsOptional()
  imageCover?: string;

  @IsMongoId({ message: 'Category ID must be a valid MongoDB ObjectId.' })
  @IsOptional()
  category?: string;
}
