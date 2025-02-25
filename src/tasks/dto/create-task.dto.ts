import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsDateString,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ChecklistDto } from '../../common/dto/checklist.dto';
import { TaskPriority } from '../enums/task-priority.enum';
export class TaskCreateDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  status: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  priority?: TaskPriority;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty()
  assignees?: string[];

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  board: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty()
  dueDate?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  description?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ChecklistDto)
  @ApiProperty()
  checklists?: ChecklistDto[];
}
