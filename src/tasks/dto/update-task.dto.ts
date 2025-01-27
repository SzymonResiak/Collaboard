import {
  IsString,
  IsOptional,
  IsMongoId,
  IsArray,
  IsEnum,
} from 'class-validator';
import { TaskStatus } from '../enums/task-status.enum';

export class TaskUpdateDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @IsEnum(TaskStatus)
  status?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  assignees?: string[];

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsOptional()
  startedAt?: Date;

  // @IsOptional()
  // @IsString()
  // completedAt: string;

  @IsString()
  @IsOptional()
  createdBy: string;
}
