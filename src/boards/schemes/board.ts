import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BoardType } from '../enums/board-type.enum';

@Schema({ timestamps: true })
export class Board extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true, enum: BoardType })
  type: BoardType;

  @Prop({ type: [Types.ObjectId], ref: 'User', required: true })
  admins: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Group' })
  group?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

export const BoardSchema = SchemaFactory.createForClass(Board);
