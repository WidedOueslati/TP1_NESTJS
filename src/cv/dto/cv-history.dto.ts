import { IsString, IsInt, IsNotEmpty } from 'class-validator';
export class CvHistoryDto {
    @IsNotEmpty()
    @IsString()
    type: string;
    @IsNotEmpty()
    @IsInt()
    userId: number;
    @IsNotEmpty()
    @IsInt()
    cvId: number;
  }