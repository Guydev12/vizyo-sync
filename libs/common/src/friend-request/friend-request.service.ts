import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FriendRequest } from  '../../../../src/user/entities/request.entity';
import { User } from '../../../../src/user/entities/user.entity';

@Injectable()
export class FriendRequestService {
  constructor(@InjectRepository(FriendRequest)
  private FriendRequestRepository:Repository<FriendRequest>
  ){}
async sendRequest(sender: User, receiver: User) {
  const request = this.FriendRequestRepository.create({
    sender,     // Assurez-vous que 'sender' est bien une instance de User
    receiver,   // Assurez-vous que 'receiver' est bien une instance de User
    status: 'PENDING',
    createdAt: new Date(),  // Corrigez 'createAt' en 'createdAt'
  });

  return await this.FriendRequestRepository.save(request);
}
async findOne(senderId,receiverId){
  //console.log("frR",id)
   const request=await this.FriendRequestRepository.findOne({
    where:{
      sender:{id:senderId},
      receiver:{id:receiverId},
    }
  })
  console.log("frR",request)
  return request
}
}

