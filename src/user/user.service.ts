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
    return await this.usersRepository.findOne({
      where:{username}
    })
  }
  async findById(id:string):Promise<User>{
    return await this.usersRepository.findOne({
      where:{id}
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
 async sendFriendRequest(receiverId,senderId){
   
   const receiver= await this.findById(receiverId)
   if(!receiver)throw new HttpException("user not found",404)
   const sender= await this.findById(senderId)
   if(!sender)throw new HttpException("user not found",404)
    
   
   /*const requestSent = await this.friendRequestService.findOne(sender.id)
   console.log(requestSent)
   console.log(sender.id)
   if(requestSent && requestSent.status==="PENDING"){
     throw new HttpException("A request is already sent",409)
   }*/
   /*const senderHasRequest = await this.usersRepository.findOne({
     where:{
       sentFriendRequests:{
         sender:{id:sender.id},
         receiver:{id:receiver.id}
       }
     }
   })*/
   
   const selfRequest= await this.friendRequestService.sendRequest(sender,sender)//check if the sender try to auto send a request
   if(selfRequest)throw new HttpException("You cant auto sent friend request",409)//if so throw an new BadRequestException
   
   const hasRequest= await this.friendRequestService.findOne(sender.id,receiver.id)//check if the sender already have a request
   
   if(hasRequest&& hasRequest.status==="PENDING")throw new HttpException("A request is already sent",409) //if they have a request and the request status is PENDING throw an new error
   
  const request = await this.friendRequestService.sendRequest(sender,receiver)
  
  return {
    msg:`friend Request sent to ${request.receiver.username}`,
    status:request.status,
    success:true
  }
   
 }
 //logic to handle the friend request
//  async addFriend(){}
  
}