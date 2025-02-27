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

export interface GroupWithMembers {
  id: string;
  name: string;
  createdBy: string;
  admins: Assignees[];
  members: Assignees[];
  boards: BoardInfo[];
}
