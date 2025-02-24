import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../common/guards/ws-jwt.guard';
import { plainToInstance } from 'class-transformer';
import { TaskOutputDto } from 'src/tasks/dto/output-task.dto';
import { TaskClass } from '../tasks/task.class';
type TaskOperation = 'CREATE' | 'UPDATE' | 'DELETE';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UseGuards(WsJwtGuard)
export class TaskGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients = new Map<
    string,
    Set<{ clientId: string; userId: string }>
  >();

  handleConnection() {}

  async handleDisconnect(client: Socket) {
    console.log('[WebSocket] Client disconnected:', client.id);

    this.connectedClients.forEach((clients, boardId) => {
      const wasRemoved = Array.from(clients).some(
        ({ clientId }) => clientId === client.id,
      );
      if (wasRemoved) {
        clients.delete(
          Array.from(clients).find(({ clientId }) => clientId === client.id),
        );

        const activeViewers = clients.size;
        console.log(
          `[WebSocket] Active viewers for board ${boardId}: ${activeViewers}`,
        );
        this.server
          .to(`board-${boardId}`)
          .emit('viewersUpdated', { activeViewers });
      }
    });
  }

  @SubscribeMessage('joinBoard')
  async handleJoinBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody() boardId: string,
  ) {
    try {
      const room = `board-${boardId}`;
      const userId = client.data.user.sub;

      await client.join(room);

      if (!this.connectedClients.has(boardId)) {
        this.connectedClients.set(boardId, new Set());
      }

      const clients = this.connectedClients.get(boardId);

      const existingConnection = Array.from(clients).find(
        (conn) => conn.clientId === client.id && conn.userId === userId,
      );

      if (!existingConnection) {
        clients.add({ clientId: client.id, userId });
        console.log(
          `[WebSocket] New client ${client.id} (user: ${userId}) joined ${room}`,
        );
      }

      const activeViewers = clients.size;
      console.log(`[WebSocket] Active viewers for ${room}: ${activeViewers}`);

      this.server.to(room).emit('viewersUpdated', { activeViewers });

      client.emit('joinedBoard', {
        boardId,
        activeViewers,
        timestamp: new Date().toISOString(),
        userId,
      });
    } catch (err) {
      console.error('[WebSocket] Error joining board:', err);
      client.emit('error', {
        message: 'Failed to join board',
        boardId,
      });
    }
  }

  @SubscribeMessage('leaveBoard')
  async handleLeaveBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody() boardId: string,
  ) {
    const room = `board-${boardId}`;
    await client.leave(room);

    const clients = this.connectedClients.get(boardId);
    if (clients) {
      clients.delete(
        Array.from(clients).find(({ clientId }) => clientId === client.id),
      );

      const activeViewers = clients.size;
      console.log(`[WebSocket] Active viewers for ${room}: ${activeViewers}`);

      this.server.to(room).emit('viewersUpdated', { activeViewers });
    }
  }

  emitBoardUpdate(boardId: string, updatedBoard: any) {
    this.server.to(`board-${boardId}`).emit('boardUpdated', updatedBoard);
  }

  async emitTaskUpdate(
    boardId: string,
    task: TaskClass,
    operation: TaskOperation,
    excludeClientId?: string,
  ) {
    const room = `board-${boardId}`;
    console.log(
      `[WebSocket] Emitting ${operation} for task ${task.id} to room ${room}`,
    );
    const taskDto = plainToInstance(TaskOutputDto, task, {
      excludeExtraneousValues: true,
    });

    const sockets = await this.server.in(room).allSockets();
    console.log(`[WebSocket] Clients in room ${room}:`, sockets.size);

    const clients = Array.from(sockets).filter((id) => id !== excludeClientId);

    for (const clientId of clients) {
      await this.server.to(clientId).emit('tasks:update', {
        operation,
        task: taskDto,
      });
    }
    console.log('[WebSocket] Event emitted to', clients.length, 'clients');
  }
}
