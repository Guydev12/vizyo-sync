import { Injectable } from '@nestjs/common';
import { JwtService as Jwt } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(private readonly jwt: Jwt) {}

  generateToken(payload: any) {
    return this.jwt.sign(payload);
  }

  verifyToken(token: string) {
    return this.jwt.verify(token);
  }

}
