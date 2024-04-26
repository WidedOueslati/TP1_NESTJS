import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  async findOneByEmail(email: string) : Promise <User>{
    const user = await this.userRepository.findOne({ where: {email: email} });
    /*if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }*/
    return user;
  }
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    console.log(createUserDto)
    const newUser = this.userRepository.create(createUserDto);
    return await this.userRepository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOneById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
  async findOneByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: {username: username} });
    /*if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }*/
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id); // Reuse findOne method to check if user exists
    this.userRepository.merge(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id); // Reuse findOne method to check if user exists
    await this.userRepository.remove(user);
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    const hashedPassword = await bcrypt.hash(password, user.salt);

    const isMatch = await bcrypt.compare(password, hashedPassword);

    return isMatch;
  }
}
