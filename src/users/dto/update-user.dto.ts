import {
  IsArray,
  IsEmail,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
export class UserUpdateDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  name?: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  @ApiPropertyOptional()
  email?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  @ApiPropertyOptional()
  groups?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  @ApiPropertyOptional()
  boards?: string[];

  //groups
  //boards

  // password: string;
}
