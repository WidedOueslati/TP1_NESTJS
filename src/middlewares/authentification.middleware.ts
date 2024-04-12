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
    //console.log('Headers:', req.headers);
    //console.log('Auth Header:', authHeader);
    if (!authHeader) {
      throw new UnauthorizedException('Access token is missing');
    }

    try {
      const token = authHeader.split(' ')[1]; 
      console.log("tokne", token);
      const decodedToken = jwt.verify(token,process.env.SECRET)as { userId: number };
      //decode(token) as { userId: number };
        //console.log("userId", decodedToken.userId);
        RequestService.setUserId(String(decodedToken.userId));
        console.log(RequestService.getUserId());
      next(); 
    } catch (error) {
        console.log(error);
      throw new UnauthorizedException('Invalid access token');
      
    }
  }
}
