import { Expose, Transform, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ChecklistOutputDto } from '../../common/dto/checklist.dto';
import { AttachmentOutputDto } from '../../common/dto/attachment.dto';

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
  // TODO: refactor to: "assignees": {
  //   "id": "string",
  //   "name": "string",
  //   "avatar": "png/svg"
  // }

  @Expose()
  dueDate: Date;

  @Expose()
  canEdit: boolean;

  @Expose()
  board: string;

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
