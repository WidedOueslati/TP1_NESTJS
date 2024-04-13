import { UserService } from '../../user/user.service';
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { Request } from 'express';
import { FindRelationsNotFoundError } from 'typeorm';
  
  @Injectable()
  export class AdminGuard implements CanActivate {
    constructor(private jwtService: JwtService,
        private userService: UserService) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);
      console.log(token);
      if (!token) {
        throw new UnauthorizedException();
      }
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.SECRET,
        });
        request['user'] = payload;
        console.log(request.user);
        const user= await this.userService.findOne(request.user.userId);
        console.log(user);
        if ( user.role === 'admin') return true;
        else throw new UnauthorizedException();
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