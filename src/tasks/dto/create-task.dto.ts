import { IsString, IsNotEmpty, IsArray, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TaskCreateDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  status: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty()
  assignees: string[];

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  board: string;

  @IsNotEmpty()
  @IsDateString()
  @ApiProperty()
  dueDate: Date;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  description: string;
}
