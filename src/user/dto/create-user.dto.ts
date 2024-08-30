import {IsString,IsEmail,Length} from'class-validator'

export class CreateUserDto {
  @IsString()
  username:string
  
  @IsString()
  @Length(8,20)
  password:string
  
  @IsEmail()
  @IsString()
  email:string
  
}
