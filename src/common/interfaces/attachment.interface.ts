import { Types } from 'mongoose';

export interface Attachment {
  _id?: Types.ObjectId;
  id: string;
  filename: string;
  path: string;
  thumbnailPath: string;
  mimeType: string;
  size: number;
  createdAt: Date;
  uploadedBy: Types.ObjectId;
}
