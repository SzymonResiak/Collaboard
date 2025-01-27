import { Expose } from 'class-transformer';

export class OutputTaskDto {
  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  status: string;

  @Expose()
  assignees: string[];

  @Expose()
  dueDate: string;

  @Expose()
  completedAt: string;
}
