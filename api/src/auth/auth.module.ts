import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import{ConfigModule} from "@nestjs/config"
import{JwtService} from "@nestjs/jwt"


@Module({
  imports:[UserModule,ConfigModule.forRoot()],
  controllers: [AuthController],
  providers: [AuthService,JwtService],
})
export class AuthModule {}
