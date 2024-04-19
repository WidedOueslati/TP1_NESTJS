import { UserService } from '../../user/user.service';
import { RequestService } from '../../request.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { User } from '@ngneat/falso';

@Injectable()
export class JWTAuthGuard implements CanActivate {
  constructor( private userService: UserService,
    private jwtService: JwtService, private requestService: RequestService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRET,
      });
      const user=  await this.userService.findOneByUsername(payload.username);
      console.log(payload)
      RequestService.setUserId(String(user.id)); 
     
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}