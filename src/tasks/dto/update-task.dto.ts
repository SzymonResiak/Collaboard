import {
  IsString,
  IsOptional,
  IsMongoId,
  IsArray,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ChecklistDto } from './create-task.dto';
import { Type } from 'class-transformer';

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
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistDto)
  @ApiPropertyOptional()
  checklists?: ChecklistDto[];
}
