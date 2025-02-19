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

// Dodaj typ dla operacji
type TaskOperation = 'CREATE' | 'UPDATE' | 'DELETE';

interface TaskUpdatePayload {
  operation: TaskOperation;
  task: any;
  boardId: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UseGuards(WsJwtGuard)
export class TaskGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients = new Map<string, Set<string>>();

  handleConnection() {}

  handleDisconnect(client: Socket) {
    this.connectedClients.forEach((clients) => {
      if (clients.has(client.id)) {
        clients.delete(client.id);
      }
    });
  }

  @SubscribeMessage('joinBoard')
  handleJoinBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody() boardId: string,
  ) {
    try {
      client.join(`board-${boardId}`);

      if (!this.connectedClients.has(boardId)) {
        this.connectedClients.set(boardId, new Set());
      }
      this.connectedClients.get(boardId).add(client.id);

      const activeViewers = this.connectedClients.get(boardId).size;

      client.emit('joinedBoard', {
        boardId,
        activeViewers,
        timestamp: new Date().toISOString(),
        userId: client.data?.user?.sub,
      });
    } catch (err) {
      client.emit(
        'error',
        {
          message: 'Failed to join board',
          boardId,
        },
        err,
      );
    }
  }

  @SubscribeMessage('leaveBoard')
  handleLeaveBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody() boardId: string,
  ) {
    client.leave(`board-${boardId}`);
  }

  emitBoardUpdate(boardId: string, updatedBoard: any) {
    this.server.to(`board-${boardId}`).emit('boardUpdated', updatedBoard);
  }

  emitTaskUpdate(boardId: string, taskData: any, operation: TaskOperation) {
    const viewersCount = this.connectedClients.get(boardId)?.size || 0;

    const payload: TaskUpdatePayload = {
      operation,
      task: taskData,
      boardId,
    };

    this.server.to(`board-${boardId}`).emit('taskUpdated', {
      ...payload,
      timestamp: new Date().toISOString(),
      viewersCount,
    });
  }
}
