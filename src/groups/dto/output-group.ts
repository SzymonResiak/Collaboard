import { Expose } from 'class-transformer';

export class GroupOutputDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  members: string[];

  @Expose()
  admins: string[];

  @Expose()
  boards: string[];
}
