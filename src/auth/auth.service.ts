import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dto/register-user.dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async register(registerDto: RegisterUserDto): Promise<User> {
    // Check if username already exists
    const existingUserByUsername = await this.userService.findOneByUsername(registerDto.username);
    if (existingUserByUsername) {
      throw new ConflictException('Username already exists');
    }

    // Check if email already exists
    const existingUserByEmail = await this.userService.findOneByEmail(registerDto.email);
    if (existingUserByEmail) {
      throw new ConflictException('Email already in use');
    }
    return await this.userService.create(registerDto);
  }

  async login(loginDto: LoginUserDto): Promise<{ "access-token": string }> {
    const { username, password } = loginDto;
    const user: User = await this.userService.findOneByUsername(username);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const payload = {
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      'access-token': accessToken,
    };
  }
}
