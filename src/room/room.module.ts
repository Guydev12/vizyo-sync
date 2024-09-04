import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService} from '@nestjs/jwt';
import { RoomService } from './room.service';
import { Room } from './entities/room.entity';
import { RoomController } from './room.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports:[TypeOrmModule.forFeature([Room]),UserModule],
  
  controllers: [RoomController],
  providers: [RoomService,JwtService],
})
export class RoomModule {}
