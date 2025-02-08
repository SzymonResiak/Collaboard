import {
  IsEnum,
  IsNotEmpty,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';
import { BoardType } from '../enums/board-type.enum';
import { IsGroupConditional } from 'src/common/decorators/is-group-conditional.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  @IsString({ each: true })
  @ApiPropertyOptional()
  columns?: string[];

  @IsOptional()
  @IsMongoId()
  @ApiPropertyOptional()
  group?: string;

  @IsOptional()
  @IsMongoId({ each: true })
  @ApiPropertyOptional()
  admins?: string[];
}
