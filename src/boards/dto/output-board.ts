import { Expose, Transform, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { TaskOutputDto } from 'src/tasks/dto/output-task.dto';
// import { BoardColors } from '../enums/board-colors.enum';

export class ColumnOutputDto {
  @Expose()
  name: string;

  // @Expose()
  // @Transform(({ value }) => value || BoardColors.PURPLE)
  // color: BoardColors;
  @Expose()
  color: string;
}

export class BoardOutputDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  color: string;

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => ColumnOutputDto)
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map((col) => ({
          name: col.name,
          color: col.color,
        }))
      : [],
  )
  columns: ColumnOutputDto[];

  @Expose()
  admins: string[];

  @Expose()
  group: string;

  @Expose()
  @Transform(({ value }) => Boolean(value))
  favourite: boolean;

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => TaskOutputDto)
  @Transform(({ value }) => value || [])
  tasks: TaskOutputDto[];
}
