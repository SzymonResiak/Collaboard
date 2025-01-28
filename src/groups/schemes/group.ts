import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Group extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: [Types.ObjectId], ref: 'User', required: true, default: [] })
  members: string[];

  @Prop({ type: [Types.ObjectId], ref: 'User', required: true, default: [] })
  admins: string[];

  @Prop({ type: [Types.ObjectId], ref: 'Board', required: true, default: [] })
  boards: string[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

export const GroupSchema = SchemaFactory.createForClass(Group);
