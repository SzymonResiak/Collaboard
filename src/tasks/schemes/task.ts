import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TaskStatus } from '../enums/task-status.enum';
import { Checklist } from '../../common/interfaces/checklist.interface';
import { Attachment } from '../../common/interfaces/attachment.interface';

@Schema({ timestamps: true })
export class Task extends Document {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ default: TaskStatus.TODO, index: true })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdBy: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  assignees: Types.ObjectId[];

  @Prop()
  dueDate?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Board', index: true })
  board: Types.ObjectId;

  @Prop({
    type: [
      {
        _id: false,
        name: { type: String, required: true },
        items: [
          {
            _id: false,
            item: { type: String, required: true },
            isCompleted: { type: Boolean, default: false },
          },
        ],
      },
    ],
    default: [],
  })
  checklists: Checklist[];

  @Prop({
    type: [
      {
        id: { type: String, required: true },
        filename: { type: String, required: true },
        path: { type: String, required: true },
        mimeType: { type: String, required: true },
        size: { type: Number, required: true },
        createdAt: { type: Date, default: Date.now },
        uploadedBy: { type: Types.ObjectId, ref: 'User', required: true },
      },
    ],
    default: [],
  })
  attachments: Attachment[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);
