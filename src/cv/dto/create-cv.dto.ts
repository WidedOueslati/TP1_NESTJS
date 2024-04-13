import { User } from '../../user/entities/user.entity';
import { IsString, IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { JoinColumn } from 'typeorm';

export class CreateCvDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  firstname: string;

  @IsNotEmpty()
  @IsInt()
  age: number;

  @IsNotEmpty()
  @IsString()
  Cin: string;

  @IsNotEmpty()
  @IsString()
  Job: string;

  @IsOptional()
  @IsString()
  path?: string;
  
  /*@JoinColumn()
  @IsNotEmpty()
  user: User;
  Taking the logged user so remove this*/
}
