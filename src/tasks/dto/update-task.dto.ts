import {
  IsString,
  IsOptional,
  IsMongoId,
  IsArray,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { TaskStatus } from '../enums/task-status.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class TaskUpdateDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  title?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  description?: string;

  @IsOptional()
  @IsString()
  @IsEnum(TaskStatus)
  @ApiPropertyOptional()
  status?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  @ApiPropertyOptional()
  assignees?: string[];

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional()
  dueDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional()
  startedAt?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional()
  completedAt?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  createdBy: string;
}
