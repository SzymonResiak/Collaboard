import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';

export class ChecklistItemDto {
  @IsString()
  @ApiProperty()
  item: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  isCompleted?: boolean = false;
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

export class ChecklistItemOutputDto {
  @Expose()
  item: string;

  @Expose()
  isCompleted: boolean;
}

export class ChecklistOutputDto {
  @Expose()
  name: string;

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemOutputDto)
  items: ChecklistItemOutputDto[];
}
