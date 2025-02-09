import { Expose, Transform, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { TaskOutputDto } from 'src/tasks/dto/output-task.dto';

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
  columns: string[];

  @Expose()
  admins: string[];

  @Expose()
  group: string;

  @Expose()
  @Transform(({ value }) => Boolean(value))
  favourite: boolean;

  @Expose()
  @Transform(({ value }) => value || undefined)
  @ValidateNested({ each: true })
  @Type(() => TaskOutputDto)
  tasks: TaskOutputDto[];
}
