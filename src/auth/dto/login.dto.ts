import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
export class LoginDTO {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(80)
  password: string;
}
