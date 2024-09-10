import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import{IsString,IsOptional} from'class-validator'
export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @IsOptional()
  firstname?:string
  
  @IsString()
  @IsOptional()
  lastname?:string
  
  @IsString()
  @IsOptional()
  File?:string
  
  @IsString()
  @IsOptional()
  bio?:string
  
  @IsString()
  @IsOptional()
  role:string
  
  
}
