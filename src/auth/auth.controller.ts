import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto/register-user.dto';
import { User } from '@/user/entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterUserDto): Promise<User> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginUserDto): Promise<{ "access-token": string }> {
    return this.authService.login(loginDto);
  }
}
