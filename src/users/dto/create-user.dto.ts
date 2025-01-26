import {
  IsAlpha,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from 'src/auth/roles.enum';

export class CreateUserDTO {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(40)
  password: string;

  @IsAlpha()
  @IsNotEmpty()
  @IsOptional()
  name: string;

  @IsOptional()
  @IsBoolean()
  isVerified: boolean;

  @IsOptional()
  @IsEnum(Role)
  role: Role;

}
