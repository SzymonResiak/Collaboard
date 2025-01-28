import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsArray,
  IsDateString,
} from 'class-validator';
import { TaskStatus } from '../enums/task-status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class TaskCreateDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  title: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(TaskStatus)
  @ApiProperty()
  status: TaskStatus;

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
