import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from '../common/guards/ws-jwt.guard';
import { AuthService } from '../auth/auth.service';
import { GroupOutputDto } from '../groups/dto/output-group';
import { plainToInstance } from 'class-transformer';
import { Group } from '../groups/schemes/group';
import { EventCoordinatorService } from '../events/event-coordinator.service';
@UseGuards(WsJwtGuard)
@WebSocketGateway({ namespace: '/groups' })
export class GroupsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  constructor(
    private readonly authService: AuthService,
    private readonly eventCoordinatorService: EventCoordinatorService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const user = client.data.user;
      const room = `user-${user.id}`;
      await client.join(room);
      console.log(
        `[WebSocket][Groups] Client ${client.id} (user: ${user.id}) connected`,
      );
      await this.emitGroupsUpdate(client, user.id);
    } catch (err) {
      console.error('[WebSocket][Groups] Connection error:', err);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (user) {
      const room = `user-${user.id}`;
      await client.leave(room);
      console.log(
        `[WebSocket][Groups] Client ${client.id} (user: ${user.id}) disconnected`,
      );
    }
  }

  async emitGroupsUpdate(
    client: Socket,
    userId: string,
    excludeClientId?: string,
  ) {
    const groups = await this.eventCoordinatorService.getGroupsByOptions({
      ids: [],
      board: '',
    });
    const groupsDto = plainToInstance(GroupOutputDto, groups, {
      excludeExtraneousValues: true,
    });
    console.log(`Wysłano aktualizację grup dla użytkownika: ${userId}`);

    const userRoom = `user-${userId}`;
    const sockets = await this.server.in(userRoom).allSockets();
    const clients = Array.from(sockets).filter((id) => id !== excludeClientId);

    for (const clientId of clients) {
      await this.server.to(clientId).emit('groups:update', groupsDto);
    }
  }

  async emitGroupAdded(userId: string, group: Group, excludeClientId?: string) {
    const groupDto = plainToInstance(GroupOutputDto, group, {
      excludeExtraneousValues: true,
    });
    console.log(`Wysłano nową grupę (${group.id}) dla użytkownika: ${userId}`);

    const userRoom = `user-${userId}`;
    const sockets = await this.server.in(userRoom).allSockets();
    const clients = Array.from(sockets).filter((id) => id !== excludeClientId);

    for (const clientId of clients) {
      await this.server.to(clientId).emit('groups:added', groupDto);
    }
  }

  async emitGroupRemoved(userId: string, groupId: string) {
    console.log(
      `Wysłano usunięcie grupy (${groupId}) dla użytkownika: ${userId}`,
    );
    await this.server.to(`user-${userId}`).emit('groups:removed', groupId);
  }

  async emitAddedToGroup(userId: string, group: Group) {
    const groupDto = plainToInstance(GroupOutputDto, group, {
      excludeExtraneousValues: true,
    });
    await this.server.to(`user-${userId}`).emit('groups:addedTo', groupDto);
  }

  async emitRemovedFromGroup(userId: string, groupId: string) {
    await this.server.to(`user-${userId}`).emit('groups:removedFrom', groupId);
  }
}
