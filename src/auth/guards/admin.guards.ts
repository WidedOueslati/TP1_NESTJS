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
    //Check if the user is authorized as an admin
    async canActivate(context: ExecutionContext): Promise<boolean> {
        //Extracting token form the request
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);
      // If token is missing, throw UnauthorizedException
      if (!token) {
        throw new UnauthorizedException();
      }
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.SECRET,
        });
        //Storing the payload
        request['user'] = payload;
          
        // If user is admin, allow access else throw UnauthorizedException
        if ( request.user.role === 'admin') return true;
        else {throw new UnauthorizedException("you have to be an admin");}
      } catch { 
        throw new UnauthorizedException();
      }
      return true;
    }
    // Extracting token from authorization header by returning token if type is 'Bearer', otherwise undefined
    private extractTokenFromHeader(request: Request): string | undefined {
      const [type, token] = request.headers.authorization?.split(' ') ?? [];
      return type === 'Bearer' ? token : undefined;
    }
  }
