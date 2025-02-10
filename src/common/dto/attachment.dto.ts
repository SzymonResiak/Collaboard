import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';
import { Expose } from 'class-transformer';

export class AttachmentDto {
  @IsString()
  @ApiProperty()
  id: string;

  @IsString()
  @ApiProperty()
  filename: string;

  @IsString()
  @ApiProperty()
  path: string;

  @IsString()
  @ApiProperty()
  mimeType: string;

  @IsNumber()
  @ApiProperty()
  size: number;
}

export class AttachmentOutputDto {
  @Expose()
  id: string;

  @Expose()
  filename: string;

  @Expose()
  path: string;
}
