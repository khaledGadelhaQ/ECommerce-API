import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
export class UpdateReviewDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @IsOptional()
  title?: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(5000)
  @IsOptional()
  details?: string;

  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  @Min(1)
  @Max(5)
  rating: number;
}
