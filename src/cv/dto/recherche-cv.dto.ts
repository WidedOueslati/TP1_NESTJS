import { IsOptional, IsString, IsInt, IsPositive, Min } from 'class-validator';

export class RechercheCvDto {
  @IsOptional()
  @IsString()
  criteria?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  age?: number;
  
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number;
}
