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
  //Check if the user is authorized using JWT token
  async canActivate(context: ExecutionContext): Promise<boolean> {
    //Extracting token from request header
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    //Upon missing token throw an unauthorizedException
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRET,
      });
      // Fetching user details based on username from the payload
      const user=  await this.userService.findOneByUsername(payload.username);
      // Setting the user ID in the request service for future use
      RequestService.setUserId(String(user.id)); 
      // Storing the payload
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
