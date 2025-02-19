import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const token = client.handshake.auth?.token;

      if (!token) {
        this.logger.error('No token provided');
        client.emit('error', { message: 'Unauthorized - No token provided' });
        client.disconnect();
        return false;
      }

      const jwt = token.replace('Bearer ', '');

      try {
        const payload = this.jwtService.verify(jwt);
        client.data.user = payload;
        return true;
      } catch (jwtError) {
        this.logger.error('Invalid token');
        client.emit('error', { message: 'Unauthorized - Invalid token' });
        client.disconnect();
        return false;
      }
    } catch (err) {
      this.logger.error('WebSocket authorization failed', err);
      return false;
    }
  }
}
