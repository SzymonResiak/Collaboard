import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Version,
  Param,
  BadRequestException,
  Patch,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard.guard';
import { EventCoordinatorService } from 'src/events/event-coordinator.service';
import { BoardCreateDto } from './dto/create-board.dto';
import { Serialize } from '../common/interceptors/serialize.interceptor';
import { BoardOutputDto } from './dto/output-board';
import { Types } from 'mongoose';
import { BoardUpdateDto } from './dto/update-boards';
import { CurrentUserId } from '../common/decorators/current-user-id.decorator';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { BoardType } from './enums/board-type.enum';
import { BoardClass } from './boards.class';

@Controller('boards')
@UseGuards(JwtAuthGuard, AuthGuard)
@ApiBearerAuth()
@ApiTags('boards')
export class BoardController {
  constructor(private eventCoordinatorService: EventCoordinatorService) {}

  //create board POST('')
  @Version('1')
  @Post()
  @Serialize(BoardOutputDto)
  async createBoardCtrl(
    @Body() boardDto: BoardCreateDto,
    @CurrentUserId() currentUserId: string,
  ) {
    if (boardDto.type === BoardType.GROUP) {
      const group = await this.eventCoordinatorService.getGroupById(
        boardDto.group,
      );
      if (!group) throw new NotFoundException('GROUP_NOT_FOUND');

      // update group with new board
      const result = await this.eventCoordinatorService.updateGroup({
        group,
        updates: { boards: [...group.getBoards(), boardDto.group] },
      });
      if (!result) throw new BadRequestException('GROUP_BOARDS_UPDATE_FAILED');
    }

    const result = await this.eventCoordinatorService.createBoard({
      createdBy: currentUserId,
      admins: [currentUserId],
      ...boardDto,
    });
    if (!result) throw new BadRequestException('BOARD_CREATE_FAILED');

    const user = await this.eventCoordinatorService.getUserById(currentUserId);
    this.eventCoordinatorService.updateUser({
      user,
      updates: { boards: [...user.getBoards(), result.id] },
    });
    return result;
  }

  //get by id GET(':id')
  @Version('1')
  @Get(':id')
  @Serialize(BoardOutputDto)
  async getAllBoards(
    @Param('id') id: string,
    @CurrentUserId() currentUserId: string,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('INVALID_BOARD_ID');
    }

    const board = await this.eventCoordinatorService.getBoardById(id);
    if (!board) throw new NotFoundException('BOARD_NOT_FOUND');

    if (board.getType() === BoardType.GROUP) {
      const group = await this.eventCoordinatorService.getGroupById(
        board.getGroup(),
      );
      if (!group) throw new NotFoundException('GROUP_NOT_FOUND');
      if (!group.getMembers().includes(currentUserId)) {
        throw new ForbiddenException('GROUP_ACCESS_NOT_ALLOWED');
      }
    }

    return board;
  }

  //get by options GET('')
  @Version('1')
  @Get()
  @Serialize(BoardOutputDto)
  async getBoardsByOptions(
    @CurrentUserId() currentUserId: string,
    @Body('ids') ids?: string[],
    @Body('group') group?: string,
  ) {
    const user = await this.eventCoordinatorService.getUserById(currentUserId);
    const options = { ids: ids ? ids : user.getBoards(), group };

    const boards =
      await this.eventCoordinatorService.getBoardsByOptions(options);
    if (!boards) {
      throw new NotFoundException('BOARDS_NOT_FOUND');
    }

    const validBoards: BoardClass[] = [];
    for (const board of boards) {
      if (board.getType() === BoardType.GROUP) {
        const groups = await this.eventCoordinatorService.getGroupsByIds([
          board.getGroup(),
        ]);
        if (!groups) continue;

        for (const group of groups) {
          if (group.getMembers().includes(currentUserId)) {
            validBoards.push(board);
          }
        }
      }

      if (
        board.getType() === BoardType.PERSONAL &&
        board.getCreatedBy() === currentUserId
      ) {
        validBoards.push(board);
      }
    }

    return validBoards;
  }

  //update board PATCH(':id')
  @Version('1')
  @Patch(':id')
  @Serialize(BoardOutputDto)
  async updateBoardCtrl(
    @Param('id') id: string,
    @Body() boardDto: BoardUpdateDto,
    @CurrentUserId() currentUserId: string,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('INVALID_BOARD_ID');
    }

    const board = await this.eventCoordinatorService.getBoardById(id);
    if (!board) throw new NotFoundException('BOARD_NOT_FOUND');

    if (currentUserId !== board.getCreatedBy()) {
      throw new ForbiddenException('BOARD_UPDATE_NOT_ALLOWED');
    }

    const result = await this.eventCoordinatorService.updateBoard({
      board,
      updates: boardDto,
    });
    if (!result) throw new BadRequestException('BOARD_UPDATE_FAILED');
    return result;
  }

  //delete board DELETE(':id')
}
