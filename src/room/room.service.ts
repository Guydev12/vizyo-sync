import { Injectable,BadRequestException,UnauthorizedException } from '@nestjs/common';
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
    private roomRepository: Repository<Room>,
    private userService: UserService
  ) {}

  async create(createRoomDto: CreateRoomDto, userEmail: string) {
    try {
      const user = await this.userService.findEmail(userEmail);
      if (!user) throw new BadRequestException("User not found");

      const room = this.roomRepository.create({
        name: createRoomDto.name,
        user,
        participants: [user], // Assigne l'utilisateur comme participant initial
      });

      user.role = "OWNER"; // Assigner le rôle si nécessaire
      room.maxParticipants = 1; // Initialiser avec 1 participant

      const savedRoom = await this.roomRepository.save(room);
      return { msg: "Room created", room: savedRoom };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async addParticipants(roomId: string, username: string, userId: string) {
    try {
      const room = await this.roomRepository.findOne({
        where: { id: roomId },
        relations: ['participants'], // Inclure les participants
      });

      if (!room) throw new BadRequestException("Room does not exist");

      const allowedUser = await this.userService.findById(userId);
      if (!allowedUser) throw new UnauthorizedException("Not allowed");

      const user = await this.userService.findByUsername(username);
      if (!user) throw new BadRequestException("User not found");

      if (room.participants.some(participant => participant.id === user.id)) {
        throw new BadRequestException("User is already in the room");
      }

      room.participants.push(user);
      room.maxParticipants = room.participants.length;

      const updatedRoom = await this.roomRepository.save(room);
      return { msg: "User invited", room: updatedRoom };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async joinRoom(roomId: string, userId: string) {
    try {
      const room = await this.roomRepository.findOne({
        where: { id: roomId },
        relations: ['participants'],
      });

      if (!room) throw new BadRequestException("Room does not exist");

      const user = await this.userService.findById(userId);
      if (!user) throw new UnauthorizedException("User not found");

      if (room.participants.some(participant => participant.id === user.id)) {
        throw new BadRequestException("User is already in the room");
      }

      room.participants.push(user);
      room.maxParticipants = room.participants.length;

      const updatedRoom = await this.roomRepository.save(room);
      return { msg: "User joined", room: updatedRoom };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

findAll(){
  return this.roomRepository.find({
    relations:['user', 'participants']
  })
}
  
}
