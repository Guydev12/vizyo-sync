import { Module } from '@nestjs/common';
import { ConfigModule,ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './token.service';
@Module({
  providers:[TokenService],
  exports:[TokenService],
  imports:[JwtModule.registerAsync({
    imports:[ConfigModule],
    inject:[ConfigService],
    useFactory:async(configService:ConfigService)=>({
      secret:configService.get("TOKEN_SECRET"),
      signOptions:{expiresIn:'1h'}
    }),
  })]
})
export class TokenModule {}
