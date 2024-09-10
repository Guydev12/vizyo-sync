import { Injectable,UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto,LoginDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import{ConfigService} from '@nestjs/config'
import{JwtService} from '@nestjs/jwt'
import {UserService} from'../user/user.service'
import * as bcrypt from'bcryptjs'


type Payload ={
  sub:string,
  username:string,
  email:string
}
let expDate = new Date();
expDate.setTime(new Date().getTime() + 5*60*(60*1000));

let formattedTime = expDate.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
});

console.log(formattedTime); // Exemple de sortie : "18:30:45"
@Injectable()
export class AuthService {
  constructor(
    private readonly userService:UserService,
    private configService:ConfigService,
   private  jwtService:JwtService
    ){}
    
    async login(dto:LoginDto){
      const user = await this.validateUser(dto.email,dto.password)
      const payload:Payload = {
        username:user.username,
        sub:user.id,
        email: user.email
      }
      
      return{
        user,
        backenTokens:{
          access_token:await this.generateAccessToken(payload),
         refresh_token:await this.generateRefreshToken(payload),
         expDate,
         formattedTime
        }
      }
    }
    
    async refreshToken(user){
      const payload:Payload={
        username:user.username,
        sub:user.sub,
        email:user.email
      }
      return{
        backenTokens:{
          access_token:await this.generateAccessToken(payload),
         refresh_token:await this.generateRefreshToken(payload),
         expDate,
         formattedTime
        }
      }
    }
    
    
    
    
    private async validateUser(email,password)
    {
      const user = await this.userService.findEmail(email)
      if(user && (await bcrypt.compare(password,user.password))){
        return user
      }
      throw new UnauthorizedException("Invalid credential")
    }
    
  private  async generateAccessToken(payload:Payload){
      return await this.jwtService.signAsync(payload,{
        secret:this.configService.get<string>("JWT-ACCESS-TOKEN-SECRET"),
        expiresIn:"5h"
      })
    }
  private  async generateRefreshToken(payload:Payload){
      return await this.jwtService.signAsync(payload,{
        secret:this.configService.get<string>("JWT-REFRESH-TOKEN-SECRET"),
        expiresIn:"7d"
      })
    }
    
}
