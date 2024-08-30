import { Controller, Post, Body, UseInterceptors,ClassSerializerInterceptor,Req,UseGuards,Query,Get} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto ,LoginDto,UpdateAuthDto,ForgotPasswordDto,ResetPasswordDto} from './dto';
import {UserService} from '../user/user.service'

import{RefreshAuthGuard } from "@app/common"


@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    ) {}

  @Post("register")
  register(@Body() createAuthDto: CreateAuthDto) {
    return this.userService.register(createAuthDto);
  }
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.userService.verifyEmail(token);
  }
  
  @Post("login")
   login(@Body() dto:LoginDto) {
     return this.authService.login(dto);
  }
  @UseGuards(RefreshAuthGuard)
  @Post("refresh")
   refresh(@Req() req) {
     return this.authService.refreshToken(req.user);
  }
  @Post("forget-password")
  forgetPassword(@Body()dto:ForgotPasswordDto){
    return this.userService.forgotPassword(dto)
  }
@Post('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto) {

    return this.userService.resetPassword(resetPasswordDto);
  }

}
