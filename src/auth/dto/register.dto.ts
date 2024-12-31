import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '../roles.enum';
export class RegisterDTO {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(80)
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
