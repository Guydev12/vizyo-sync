import { Controller, Get, Post, Body, Patch, Param, Delete ,UseInterceptors,ClassSerializerInterceptor,UseGuards} from '@nestjs/common';
import{IsEmail} from 'class-validator'
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {AuthGuard }from "@app/common"


@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  async findAll(){
    return this.userService.findAll()
  }
  @Get(':id')
  async findOne(@Param('id') id:string ){
    return await this.userService.findOne(id)
  }
  @Patch("verify/:id")
  async verify(
      @Param('id')id:string,
  ){
    return this.userService.sendEmail(id,null)
  }
  @Patch(":id")
  async update(@Body()dto:UpdateUserDto,@Param('id')id:string){
    return this.userService.update(dto,id)
  }
@Delete(":id")
async delete(@Param('id') id:string){
  return this.userService.remove(id)
}


}
