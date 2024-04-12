import { PartialType } from '@nestjs/mapped-types';
import { CreateCvDto } from './create-cv.dto';
import { IsOptional,IsInt } from 'class-validator';

export class UpdateCvDto extends PartialType(CreateCvDto) {
  
  @IsInt()  
  @IsOptional()
  userId?: number ;
}
