import { Expose } from 'class-transformer';

export class UserOutputDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  memberCode: string;

  // using this to fetch all users in the system, should not give any sensitive information
  // @Expose()
  // email: string;

  @Expose()
  groups: string[];

  @Expose()
  boards: string[];
}
