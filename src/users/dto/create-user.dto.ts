import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsEmail,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class UserCreateDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(32)
  @ApiProperty({ minLength: 4, maxLength: 32 })
  login: string;

  @IsString()
  @MinLength(6, { message: 'Password is too short (6 characters min)' })
  @MaxLength(64, { message: 'Password is too long (64 characters max)' })
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ minLength: 6, maxLength: 64 })
  password: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @ApiProperty()
  email: string;
}
