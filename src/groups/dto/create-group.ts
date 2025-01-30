import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class GroupCreateDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  description: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  @ApiPropertyOptional()
  members?: string[];

  // @IsOptional()
  // @IsArray()
  // @IsMongoId({ each: true })
  // @ApiProperty()
  // admins: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional()
  boards?: string[];
}
