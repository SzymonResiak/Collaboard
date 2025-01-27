import { Expose } from 'class-transformer';

export class UserOutputDto {
  @Expose()
  name: string;

  // using this to fetch all users in the system, should not give any sensitive information
  // @Expose()
  // email: string;

  // @Expose()
  // groups: string[];

  // @Expose()
  // tables: string[];
}
