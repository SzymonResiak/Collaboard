import { Expose, Transform, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class ChecklistItemDto {
  @Expose()
  id: string;

  @Expose()
  text: string;

  @Expose()
  isCompleted: boolean;
}

export class ChecklistDto {
  @Expose()
  name: string;

  @Expose()
  @Type(() => ChecklistItemDto)
  items: ChecklistItemDto[];
}

export class AttachmentDto {
  @Expose()
  id: string;

  @Expose()
  filename: string;

  @Expose()
  path: string;
}

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
  assignees: string[];

  @Expose()
  dueDate: Date;

  @Expose()
  board: string;

  @Expose()
  startedAt: Date;

  @Expose()
  completedAt: Date;

  @Expose()
  @Transform(({ value }) => value || undefined)
  @ValidateNested({ each: true })
  @Type(() => ChecklistDto)
  checklists: ChecklistDto[];

  @Expose()
  @Transform(({ value }) => value || undefined)
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments: AttachmentDto[];
}
