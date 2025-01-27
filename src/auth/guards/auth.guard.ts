import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { EventCoordinatorService } from 'src/events/event-coordinator.service';

@Injectable()
export class AuthGuard {
  constructor(private eventCoordinatorService: EventCoordinatorService) {}

  async authenticateUser(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const data = request.user;
    if (!data || !data.id) {
      throw new UnauthorizedException('User authentication failed');
    }

    const user = await this.eventCoordinatorService.getUserById(
      data.id,
      ' +hashedPasswd',
    );
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    request.user = user;
    return user;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await this.authenticateUser(context);
    return true;
  }
}
