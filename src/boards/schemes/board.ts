import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BoardType } from '../enums/board-type.enum';
import { BoardColors } from '../enums/board-colors.enum';
import { Column } from '../interfaces/column.interface';

@Schema({ timestamps: true })
export class Board extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true, enum: BoardType })
  type: BoardType;

  @Prop({ required: true })
  color: string;

  @Prop({ type: [Types.ObjectId], ref: 'User', required: true })
  admins: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Group' })
  group?: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  favourite: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({
    type: [
      {
        _id: false,
        name: { type: String, required: true },
        color: {
          type: String,
          enum: Object.values(BoardColors),
        },
      },
    ],
    default: [
      { name: 'To Do', color: BoardColors.PURPLE },
      { name: 'In Progress', color: BoardColors.BLUE },
      { name: 'Done', color: BoardColors.GREEN },
    ],
  })
  columns: Column[];
}

export const BoardSchema = SchemaFactory.createForClass(Board);
