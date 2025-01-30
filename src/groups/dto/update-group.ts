import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class GroupUpdateDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  name?: string;

  @IsNotEmpty()
  @IsString()
  @ApiPropertyOptional()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  @ApiPropertyOptional()
  members?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  @ApiPropertyOptional()
  admins?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional()
  boards?: string[];
}
