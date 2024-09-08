import { Injectable,HttpException,ConflictException,BadRequestException,NotFoundException } from '@nestjs/common';

import * as crypto from"crypto"
import { InjectRepository} from '@nestjs/typeorm';
import { Repository,MoreThan ,Like} from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from "bcryptjs"
import { User } from './entities/user.entity';
import { FriendRequest } from './entities/request.entity';
import {ForgotPasswordDto,ResetPasswordDto} from "../auth/dto"
import { UpdateUserDto } from './dto/update-user.dto';
import{TokenService,EmailService ,FriendRequestService} from '@app/common'



@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private friendRequestService:FriendRequestService,
    private tokenService: TokenService,
    private emailService: EmailService,
    
  ) {}
  //method to register a user
  async register(dto: CreateUserDto) {
    try {
      const userWithEmail = await this.usersRepository.findOne({
        where: { email: dto.email },
      });
      if (userWithEmail) {
        throw new ConflictException('Email is already in use');
      }

      const userWithUsername = await this.usersRepository.findOne({
        where: { username: dto.username },
      });
      if (userWithUsername) throw new ConflictException('Username already in use');
      
      const user = this.usersRepository.create({ ...dto });
      await this.usersRepository.save(user);

      await this.sendEmail(null,dto.email)
      
      return`A Email was sent to ${dto.email}`

    } catch (err) {
      console.log(err);
      throw new HttpException(err.response.message, err.status);
    }
  }

  async sendEmail(id?:string,email?:string){
    const user = await this.usersRepository.findOne({
      where:{id}
    })
    if(id!==null && !user){
      throw new HttpException("user not found",404)
    }else if(id!==null && user){
      const verificationToken = await this.tokenService.generateToken({
        email:user.email
      });
       await this.emailService.sendVerificationEmail(user.email, verificationToken);
    }else{
    
    const verificationToken = await this.tokenService.generateToken({
        email
      });

      await this.emailService.sendVerificationEmail(email, verificationToken);
    }
  }

  async verifyEmail(token: string) {
    const decoded = this.tokenService.verifyToken(token);

    const user = await this.findEmail(decoded.email);
    
    if (!user) {
      throw new Error('User not found');
    }

    user.isVerified = true;
    await this.usersRepository.save(user);

    return 'Email successfully verified';
  }

  async findEmail(email: string): Promise<User> {
    return await this.usersRepository.findOne({
      where: { email },
    });
  }
  
  
  async findAll(){
    return this.usersRepository.find()
  }
  
  async findOne(userId:string):Promise<User>{
    const user = await this.usersRepository.findOne({
      where:{id:userId},
      relations:[
        'friends',
        'rooms',
        'participatingRooms',
        'sentFriendRequests',
        'sentFriendRequests.receiver',
        'receivedFriendRequests',
        'receivedFriendRequests.sender',
       // 'receivedFriendRequests.sender',
        ]
    })
    
    if(!user)throw new HttpException("User not Found",404)
    return user
  }
  
private generateResetCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.findEmail(dto.email);
    if (!user) {
      throw new HttpException('User with this email does not exist', 404);
    }

    const resetCode = await this.generateResetCode();
    console.log(resetCode)
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    console.log(user)
    await this.usersRepository.save(user);

    await this.emailService.sendPasswordResetEmail(user.email, resetCode);

    return 'Password reset code sent';
  }
  async verifyResetCode(code:string){
    console.log("service code : ",code)
    const user = await this.usersRepository.findOne({
      where: {
        resetPasswordCode:code,
        resetPasswordExpires:MoreThan(new Date()),
      },
    });
    if (!user) {
      throw new HttpException('Reset code is invalid or has expired', 400);
    }
    console.log("user",user)
    console.log("code ",user.resetPasswordCode)
    
    //
    
    return await this.tokenService.generateToken({email:user.email})
    
  }
  async resetPassword(token,newPassword) {
   const decoded= await this.tokenService.verifyToken(token)
   const user = await this.findEmail(decoded.email)
   if (!user) {
      throw new Error('User not found');
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;

    
    await this.usersRepository.save(user);

    return 'Password has been reset';
  }
  
  
async update(dto: UpdateUserDto, id: string) {
  
  const user = await this.usersRepository.findOne({ where: { id } });

  if (!user) {
    throw new HttpException('User not found', 404);
  }
  
  // Mise à jour des informations de l'utilisateur
   Object.assign(user, {...dto});
   user.fullname=`${dto.lastname} ${dto.firstname}`

  // Sauvegarde des modifications dans la base de données
  return await this.usersRepository.save(user);
  
  
}
async remove(id:string){
  const user = await this.usersRepository.findOne({ where: { id } });

  if (!user) {
    throw new HttpException('User not found', 404);
  }
  await this.usersRepository.remove(user)
  return "User Removed successfully"
}

async updateAvatar(id: string, avatarUrl: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where:{id}
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.avatarUrl = avatarUrl;
    return this.usersRepository.save(user);
  }
  async findByUsername(username:string):Promise<User>{
    //console.log("name",username)
    const user= await this.usersRepository.findOne({
      where:{username}
    })
  //  console.log("users",user)
    return user
  }
  async findById(id:string):Promise<User>{
    return await this.usersRepository.findOne({
      where:{id},
      relations:[
        'friends',      
        'rooms',
        'participatingRooms',
        'sentFriendRequests',
        'sentFriendRequests.receiver',
        'receivedFriendRequests',
        'receivedFriendRequests.sender',
        ]
    })
  }
  
  

async search(userTofind: string) {
  // Vérifier que la chaîne de recherche n'est pas vide
  if (!userTofind || userTofind.trim().length === 0) {
    throw new BadRequestException('La chaîne de recherche ne peut pas être vide');
  }

  // Rechercher les utilisateurs avec une lettre ou chaîne dans le fullname ou le username
  const users = await this.usersRepository.find({
    where: [
      { fullname: Like(`%${userTofind}%`) },
      { username: Like(`%${userTofind}%`) }
    ],
    relations:['friends','rooms']
  });

  // Vérifier s'il y a des utilisateurs trouvés
  if (users.length === 0) {
    throw new NotFoundException('Aucun utilisateur trouvé');
  }
  const total_users=users.length
  return {
    total_users,
    users
  };
}
 async sendFriendRequest(senderId, username) {
  // Step 1: Find the receiver (user to whom the friend request is being sent) by their username
  const receiver = await this.findByUsername(username);
  
  // If the receiver is not found, throw a 404 error
  if (!receiver) throw new HttpException("User not found", 404);

  // Step 2: Find the sender (the user sending the friend request) by their ID
  const sender = await this.findById(senderId);
  
  // If the sender is not found, throw a 404 error
  if (!sender) throw new HttpException("User not found", 404);

  // Step 3: Check if the sender has already sent a friend request to the receiver
  const hasRequest = await this.friendRequestService.findOne(sender.id, receiver.id);

  // Debug logs: Check what request is found and its status
  console.log("hasRequest", hasRequest);
  console.log("hasRequestStatus", hasRequest?.status);

  // Step 4: If there is already a PENDING request, throw a 409 error (Conflict)
  if (hasRequest && hasRequest.status === "PENDING") {
    throw new HttpException("A request is already sent", 409);
  }

  // Step 5: Send the friend request by calling the service method
  const request = await this.friendRequestService.sendRequest(sender, receiver);

  // Step 6: Check if the request is an attempt to send a request to oneself (auto-send)
  const reqSenderId = request.sender.id;
  const reqReceiverId = request.receiver.id;

  // If the sender and receiver are the same, throw an error
  if (reqReceiverId === reqSenderId) {
    throw new HttpException("You can't auto send a friend request", 409);
  }

  // Step 7: Return a success message if the friend request is successfully sent
  return {
    msg: `Friend request sent to ${request.receiver.username}`,
    status: request.status,
    success: true
  };
}
 //logic to handle the friend request
 async handleFriendRequestStatus(status, requestId) {
  try {
    // Step 1: Find the friend request using the requestId
    const request = await this.friendRequestService.findOneRequest(requestId);
    
    // If the request is not found, throw a 404 error
    if (!request) {
      throw new HttpException("Request not found", 404);
    }

    // Step 2: If the status is provided, process it
    if (status) {
      // Convert status to uppercase for consistency
      const upperCaseStatus = status.toUpperCase();

      // If status is "DECLINED", update the request status to "DECLINED"
      if (upperCaseStatus === "DECLINED") {
        request.status = upperCaseStatus;
        // TODO: Send a notification to the client indicating the request was declined

      // If status is "ACCEPTED", update request status and add friends
      } else if (upperCaseStatus === "ACCEPTED") {
        request.status = upperCaseStatus;
        // TODO: Send a notification to the client indicating the request was accepted

        // Step 3: Find the sender and receiver of the request
        const sender = await this.findById(request.sender.id);
        const receiver = await this.findById(request.receiver.id);
        
        // Check if sender or receiver is missing (for safety)
        if (!sender || !receiver) throw new HttpException('User not found', 404);

        // Step 4: Add each user to the other's friends list
        // Initialize friends arrays if not already done (prevent undefined errors)
        if (!sender.friends) sender.friends = [];
        if (!receiver.friends) receiver.friends = [];
        
        // Push each user to the other's friends list
        sender.friends.push(receiver);
        receiver.friends.push(sender);

        // Step 5: Save the updated sender and receiver in the database
        await this.usersRepository.save(sender);
        await this.usersRepository.save(receiver);
        
      } else {
        // If the status is not "ACCEPTED" or "DECLINED", return the current request status
        return request.status;
      }
    }

    // Step 6: Save the updated friend request (with new status)
    return await this.friendRequestService.save(request);

  } catch (err) {
    // Log any errors that occur
    console.log(err);
  }
}
 async findOneFriend(userId):Promise<User>{
   return await this.usersRepository.findOne({
     where:{
       friends:{
           id:userId
       }
     }
   })
 }
  
}