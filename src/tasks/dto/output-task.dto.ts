import { Expose, Transform, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ChecklistOutputDto } from '../../common/dto/checklist.dto';
import { AttachmentOutputDto } from '../../common/dto/attachment.dto';

// export class ChecklistItemDto {
//   @Expose()
//   item: string;

//   @Expose()
//   isCompleted: boolean;
// }

// export class ChecklistDto {
//   @Expose()
//   name: string;

//   @Expose()
//   @Type(() => ChecklistItemDto)
//   items: ChecklistItemDto[];
// }

// export class AttachmentDto {
//   @Expose()
//   id: string;

//   @Expose()
//   filename: string;

//   @Expose()
//   path: string;
// }

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
  @Type(() => ChecklistOutputDto)
  checklists: ChecklistOutputDto[];

  @Expose()
  @Transform(({ value }) => value || undefined)
  @ValidateNested({ each: true })
  @Type(() => AttachmentOutputDto)
  attachments: AttachmentOutputDto[];
}
