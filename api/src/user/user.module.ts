import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { FriendRequest } from './entities/request.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import{TokenModule,EmailService,FriendRequestModule} from "@app/common"



@Module({
  imports:[
    TypeOrmModule.forFeature([
      User
      ]),
    FriendRequestModule,
    TokenModule
  ],
  controllers: [UserController],
  providers: [UserService,JwtService,EmailService],
  exports: [UserService],
})
export class UserModule {}
