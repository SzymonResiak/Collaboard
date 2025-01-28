import { Expose } from 'class-transformer';

export class OutputTaskDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  status: string;

  @Expose()
  assignees: string[];

  @Expose()
  dueDate: Date;

  @Expose()
  startedAt: Date;

  @Expose()
  completedAt: Date;
}
