import { IsString, MaxLength, MinLength } from 'class-validator';
export class newPasswordDTO {
  @IsString()
  @MinLength(8)
  @MaxLength(80)
  password: string;
}
