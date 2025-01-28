import {
  IsAlphanumeric,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCategoryDTO {
  @IsString()
  @MinLength(3)
  @MaxLength(400)
  name: string;

  @IsString()
  @IsOptional()
  image: string;
}
