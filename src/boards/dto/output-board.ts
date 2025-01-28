import { Expose } from 'class-transformer';

export class BoardOutputDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  admins: string[];

  @Expose()
  group: string;
}
