// reset-password.dto.ts
import { IsString, IsNotEmpty, MinLength, Length } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @Length(6,20)
  newPassword: string;
  @IsString()
  resetCode:string
}