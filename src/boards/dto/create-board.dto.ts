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

  @IsNotEmpty()
  @IsEnum(BoardType)
  @ApiProperty()
  type: BoardType;

  @IsGroupConditional()
  @IsMongoId()
  @ApiPropertyOptional()
  group?: string;

  @IsNotEmpty({ each: true })
  @IsMongoId({ each: true })
  @ApiProperty()
  admins: string[];
}
