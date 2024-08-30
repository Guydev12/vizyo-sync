import{Injectable,CanActivate,ExecutionContext,UnauthorizedException} from'@nestjs/common'
import{ Request } from 'express'
import{JwtService} from '@nestjs/jwt'
import{ConfigService} from '@nestjs/config'

@Injectable()
export class RefreshAuthGuard implements CanActivate{
  constructor(
    private configService:ConfigService,
    private jwtService:JwtService
    ){}
  async canActivate(context:ExecutionContext):Promise<boolean>{
    const req = context.switchToHttp().getRequest()
    const token = this.extractTokenFromHeaders(req)
    try{
    if(!token){
      throw new UnauthorizedException()
    }
    const payload = await this.jwtService.verify(token,{
      secret:this.configService.get<string>("JWT-REFRESH-TOKEN-SECRET")
    })
    req['user']=payload
    }catch{
      throw new UnauthorizedException()
    }
    return true
  }
  
  private extractTokenFromHeaders(request:Request):string|undefined{
    const[type,token]=request.headers.authorization?.split(' ')??[]
    return type==="Refresh"?token:undefined
  }
}