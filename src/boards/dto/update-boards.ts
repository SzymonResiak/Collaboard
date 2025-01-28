import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { BoardType } from '../enums/board-type.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

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
  @IsEnum(BoardType)
  @ApiPropertyOptional()
  type?: BoardType;

  @IsOptional({ each: true })
  @IsMongoId({ each: true })
  @ApiPropertyOptional()
  admins?: string[];
}
