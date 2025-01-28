import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateCategoryDTO {
  @IsString()
  @MinLength(3)
  @MaxLength(400)
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  image: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description: string;
}
