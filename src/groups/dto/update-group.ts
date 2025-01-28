import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty()
  name?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  @ApiProperty()
  members?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  @ApiProperty()
  admins?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty()
  boards?: string[];
}
