import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
export class signInDTO {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(40)
  password: string;
}
