import { Injectable,BadRequestException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository} from 'typeorm';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Room } from './entities/room.entity';
import { UserService } from '../user/user.service';


@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private roomRepository:Repository<Room>,
    private userService:UserService
  ){}
  
 async create(createRoomDto: CreateRoomDto, userEmail: string) {
   try{
      const user = await this.userService.findEmail(userEmail);
    
      // Check if the user exists
      if (!user) throw new BadRequestException("User not found");
    
      // Create the room and set initial properties
      const room = this.roomRepository.create({
        name: createRoomDto.name,
        user,
      });
    
      // Initialize participants array and add the user as the owner
      room.participants = [user];  // Add the user entity to the participants array
      console.log("participants",room.participants)
      user.role = "OWNER";  
      console.log("role",user.role)// Assuming this is how you're handling roles
    
      // Set maxParticipants based on participants array length
      room.maxParticipants = room.participants.length;
      console.log("max",room.maxParticipants)
      console.log("user",user)
      // Save the room entity
      const sRoom =await this.roomRepository.save(room);
      console.log(sRoom)
      return {msg: "Room created"}
   }catch(err){
     console.log(err)
   }
}


  
}
