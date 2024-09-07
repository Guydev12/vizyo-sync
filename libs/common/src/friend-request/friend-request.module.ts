import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendRequestService} from'./friend-request.service'
import { FriendRequest } from '../../../../src/user/entities/request.entity';

@Module({
  providers:[FriendRequestService],
  exports:[FriendRequestService],
  imports:[TypeOrmModule.forFeature([FriendRequest])]
})
export class FriendRequestModule {
  
}
