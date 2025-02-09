import {
  IsEnum,
  IsNotEmpty,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BoardType } from '../enums/board-type.enum';
import { IsGroupConditional } from 'src/common/decorators/is-group-conditional.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BoardColors } from '../enums/board-colors.enum';

export class ColumnDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsEnum(BoardColors)
  @ApiProperty({ enum: BoardColors })
  color: BoardColors;
}

export class BoardCreateDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  description?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  color?: string;

  @IsNotEmpty()
  @IsEnum(BoardType)
  @IsGroupConditional()
  @ApiProperty()
  type: BoardType;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ColumnDto)
  @ApiPropertyOptional()
  columns?: ColumnDto[];

  @IsOptional()
  @IsMongoId()
  @ApiPropertyOptional()
  group?: string;

  @IsOptional()
  @IsMongoId({ each: true })
  @ApiPropertyOptional()
  admins?: string[];
}
