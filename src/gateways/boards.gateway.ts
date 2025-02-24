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
import { BoardService } from '../boards/boards.service';
import { BoardOutputDto } from '../boards/dto/output-board';
import { plainToInstance } from 'class-transformer';
import { Board } from '../boards/schemes/board';

@UseGuards(WsJwtGuard)
@WebSocketGateway({ namespace: '/boards' })
export class BoardsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  constructor(
    private readonly authService: AuthService,
    private readonly boardService: BoardService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const user = client.data.user;
      const room = `user-${user.id}`;
      await client.join(room);
      console.log(
        `[WebSocket][Boards] Client ${client.id} (user: ${user.id}) connected`,
      );
      await this.emitBoardsUpdate(client, user.id);
    } catch (err) {
      console.error('[WebSocket][Boards] Connection error:', err);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (user) {
      const room = `user-${user.id}`;
      await client.leave(room);
      console.log(
        `[WebSocket][Boards] Client ${client.id} (user: ${user.id}) disconnected`,
      );
    }
  }

  async emitBoardsUpdate(
    client: Socket,
    userId: string,
    excludeClientId?: string,
  ) {
    const boards = await this.boardService.getBoardsByOptions({
      ids: [],
      group: '',
    });
    const boardsDto = plainToInstance(BoardOutputDto, boards, {
      excludeExtraneousValues: true,
    });
    console.log(`Wysłano aktualizację tablic dla użytkownika: ${userId}`);

    // Wysyłamy do wszystkich socketów użytkownika oprócz tego który wykonał akcję
    const userRoom = `user-${userId}`;
    const sockets = await this.server.in(userRoom).allSockets();
    const clients = Array.from(sockets).filter((id) => id !== excludeClientId);

    for (const clientId of clients) {
      await this.server.to(clientId).emit('boards:update', boardsDto);
    }
  }

  async emitBoardAdded(userId: string, board: Board, excludeClientId?: string) {
    const boardDto = plainToInstance(BoardOutputDto, board, {
      excludeExtraneousValues: true,
    });
    console.log(
      `Wysłano nową tablicę (${board.id}) dla użytkownika: ${userId}`,
    );

    const userRoom = `user-${userId}`;
    const sockets = await this.server.in(userRoom).allSockets();
    const clients = Array.from(sockets).filter((id) => id !== excludeClientId);

    for (const clientId of clients) {
      await this.server.to(clientId).emit('boards:added', boardDto);
    }
  }

  async emitBoardRemoved(userId: string, boardId: string) {
    console.log(
      `Wysłano usunięcie tablicy (${boardId}) dla użytkownika: ${userId}`,
    );
    await this.server.to(`user-${userId}`).emit('boards:removed', boardId);
  }
}
