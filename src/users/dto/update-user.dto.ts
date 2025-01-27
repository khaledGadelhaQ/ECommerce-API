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
import { Role } from 'src/common/enums/roles.enum';

export class UpdateUserDTO {
  @IsEmail()
  @IsOptional()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(40)
  @IsOptional()
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
