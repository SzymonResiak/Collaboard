import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsDateString,
  IsOptional,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

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

export class ChecklistDto {
  @IsString()
  @ApiProperty()
  name: string;

  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  @ApiProperty()
  items: ChecklistItemDto[];
}

export class ChecklistItemDto {
  @IsString()
  @ApiProperty()
  text: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  isCompleted?: boolean = false;
}
