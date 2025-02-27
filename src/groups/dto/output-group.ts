import { Expose } from 'class-transformer';
import { Assignees } from 'src/tasks/interfaces/assignees';

interface BoardStatus {
  name: string;
  count: number;
  color: string;
}

interface BoardInfo {
  id: string;
  name: string;
  statuses: BoardStatus[];
}

export class GroupOutputDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  members: string[] | Assignees[];

  @Expose()
  admins: string[] | Assignees[];

  @Expose()
  boards: string[] | BoardInfo[];
}
