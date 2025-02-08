import {
  IsAlphanumeric,
  IsOptional,
  IsString,
  maxLength,
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
  @MaxLength(500)
  description: string;
}
