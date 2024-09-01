import { Controller, Get, Post, Body, Patch, Param, Delete ,UseInterceptors,ClassSerializerInterceptor,UseGuards,UploadedFile,BadRequestException} from '@nestjs/common';
import{IsEmail} from 'class-validator'
import {FileInterceptor} from'@nestjs/platform-express'
import {diskStorage} from'multer'
import {extname} from'path'
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {AuthGuard }from "@app/common"
import {Express} from 'express'
import {Multer} from 'multer'

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
@Post(':id/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',  // Specify the directory to store the files
        filename: (req, file, callback) => {
          const fileExtName = extname(file.originalname);
          const fileName = `${req.params.id}-${Date.now()}${fileExtName}`;
          callback(null, fileName);
        },
      }),
      limits: { fileSize: 2 * 1024 * 1024 },  // Limit file size to 2MB
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png','multipart/form-data'];
        console.log(file)
        if (allowedMimeTypes.includes(file.mimetype)) {
          
          callback(null, true);
        } else {
          callback(new BadRequestException('Invalid file type'), false);
        }
      },
    }),
  )
  async uploadAvatar(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    console.log(file)
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    await this.userService.updateAvatar(id, avatarUrl);

    return { avatarUrl };
  }

}
