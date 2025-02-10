import {
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { BoardType } from '../enums/board-type.enum';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { BoardColors } from '../enums/board-colors.enum';
import { Column } from '../interfaces/column.interface';

export class BoardUpdateDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  name?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  description?: string;

  @IsOptional()
  @IsString()
  @IsEnum(BoardColors)
  @ApiPropertyOptional({ enum: BoardColors })
  color?: BoardColors;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ColumnDto)
  @ApiPropertyOptional()
  columns?: Column[];

  @IsOptional()
  @IsEnum(BoardType)
  @ApiPropertyOptional()
  type?: BoardType;

  @IsOptional({ each: true })
  @IsMongoId({ each: true })
  @ApiPropertyOptional()
  admins?: string[];

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  favourite?: boolean;
}

export class ColumnDto {
  @IsString()
  @ApiProperty()
  name: string;

  // @IsEnum(BoardColors)
  // @ApiProperty({ enum: BoardColors })
  // color: BoardColors;
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  color?: string;
}
