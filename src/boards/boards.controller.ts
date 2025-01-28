import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Version,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard.guard';
import { EventCoordinatorService } from 'src/events/event-coordinator.service';
import { BoardCreateDto } from './dto/create-board.dto';
import { UserClass } from '../users/user.class';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Serialize } from '../common/interceptors/serialize.interceptor';
import { BoardOutputDto } from './dto/output-board';
import { Types } from 'mongoose';
import { BoardUpdateDto } from './dto/update-boards';
import { CurrentUserId } from '../common/decorators/current-user-id.decorator';

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
    @CurrentUser() user: UserClass,
  ) {
    const result = await this.eventCoordinatorService.createBoard({
      createdBy: user.id,
      ...boardDto,
    });
    if (!result) throw new Error('BOARD_CREATE_FAILED');
    return result;
  }

  //get all GET(':id')
  @Version('1')
  @Get(':id')
  @Serialize(BoardOutputDto)
  async getAllBoards(@Param('id') id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('INVALID_BOARD_ID');
    }

    const board = await this.eventCoordinatorService.getBoardById(id);
    if (!board) throw new Error('BOARD_NOT_FOUND');

    return board;
  }

  //get by options GET('')
  @Version('1')
  @Get()
  @Serialize(BoardOutputDto)
  async getBoardsByOptions(
    @Body('ids') ids: string[],
    @Body('group') group: string,
  ) {
    const options = { ids, group };
    const boards =
      await this.eventCoordinatorService.getBoardByOptions(options);
    if (!boards) throw new Error('BOARD_NOT_FOUND');

    return boards;
  }

  //update board PATCH(':id')
  @Version('1')
  @Post(':id')
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
    if (!board) throw new Error('BOARD_NOT_FOUND');

    if (currentUserId !== board.getCreatedBy()) {
      throw new BadRequestException('BOARD_UPDATE_NOT_ALLOWED');
    }

    const result = await this.eventCoordinatorService.updateBoard({
      board,
      updates: boardDto,
    });
    if (!result) throw new Error('BOARD_UPDATE_FAILED');
    return result;
  }

  //delete board DELETE(':id')
}
