import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RequestService } from '../request.service';
import { decode, verify } from 'jsonwebtoken';
import * as jwt from 'jsonwebtoken';
import * as dotenv from "dotenv";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private requestService: RequestService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'] as string;
    
    // If authorization header is missing, throw UnauthorizedException
    if (!authHeader) {
      throw new UnauthorizedException('Access token is missing');
    }

    try {
      // Extracting token 
      const token = authHeader.split(' ')[1]; 
      // Verifying and decoding the token using the JWT SECRET
      const decodedToken = jwt.verify(token,process.env.SECRET)as { userId: number };
      // Setting the user ID in the request service for future use
        RequestService.setUserId(String(decodedToken.userId));
      
      next(); 
    } catch (error) {
        console.log(error);
      throw new UnauthorizedException('Invalid access token');
      
    }
  }
}
