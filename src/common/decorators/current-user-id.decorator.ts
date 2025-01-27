import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserClass } from 'src/users/user.class';

export const CurrentUserId = createParamDecorator(
  (data: any, context: ExecutionContext): string => {
    const req = context.switchToHttp().getRequest();
    const user: UserClass = req.user;
    return user.id;
  },
);
