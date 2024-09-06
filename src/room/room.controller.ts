import { Controller, Get, Post, Body, Patch, Param, Delete,Req,UseGuards } from '@nestjs/common';
import { RoomService } from './room.service';
import{AuthGuard} from'@app/common'
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@UseGuards(AuthGuard)
@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  create(
    @Body() createRoomDto: CreateRoomDto,
    @Req() req
    ) {
    console.log(req.user)
    return this.roomService.create(createRoomDto ,req.user.email);
  }
 
 
 @Post(':id')
 async addParticipants(@Param('id') id:string,@Body('username') username:string,@Req()req){
   return await this.roomService.addParticipants(id,username,req.user.sub)
 }
 @Get()
 findAll(){
   return this.roomService.findAll()
 }

}
