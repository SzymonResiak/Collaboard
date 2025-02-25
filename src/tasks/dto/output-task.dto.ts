import { Expose, Transform, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ChecklistOutputDto } from '../../common/dto/checklist.dto';
import { AttachmentOutputDto } from '../../common/dto/attachment.dto';
import { TaskPriority } from '../enums/task-priority.enum';
import { Assignees } from '../interfaces/assignees';

export class TaskOutputDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  status: string;

  @Expose()
  assignees: Assignees[];

  @Expose()
  dueDate: Date;

  @Expose()
  canEdit: boolean;

  @Expose()
  board: string;

  @Expose()
  priority: TaskPriority;

  @Expose()
  @Transform(({ value }) => value || undefined)
  @ValidateNested({ each: true })
  @Type(() => ChecklistOutputDto)
  checklists: ChecklistOutputDto[];

  @Expose()
  @Transform(({ value }) => value || undefined)
  @ValidateNested({ each: true })
  @Type(() => AttachmentOutputDto)
  attachments: AttachmentOutputDto[];
}
