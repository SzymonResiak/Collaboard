import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { GroupsGateway } from './groups.gateway';
import { BoardsGateway } from './boards.gateway';
import { WsJwtGuard } from '../common/guards/ws-jwt.guard';
import { TaskGateway } from './task.gateway';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION', '24h'),
        },
      }),
    }),
  ],
  providers: [GroupsGateway, BoardsGateway, WsJwtGuard, TaskGateway],
  exports: [GroupsGateway, BoardsGateway, TaskGateway],
})
export class GatewayModule {}
