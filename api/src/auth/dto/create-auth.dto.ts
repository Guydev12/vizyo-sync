import {IsString,IsEmail,Length} from'class-validator'

export class CreateAuthDto {
  @IsString()
  username:string
  
  @IsString()
  @Length(8,20)
  password:string
  
  @IsEmail()
  @IsString()
  email:string
  
}
export class LoginDto {

  
  @IsString()
  @Length(8,20)
  password:string
  
  @IsEmail()
  @IsString()
  email:string
  
}
