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
  Query,
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
import { TaskClass } from 'src/tasks/task.class';
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

  @Version('1')
  @Get('name/:name')
  @Serialize(BoardOutputDto)
  async getBoardByName(
    @Param('name') name: string,
    @CurrentUserId() currentUserId: string,
  ) {
    const board = await this.eventCoordinatorService.getBoardByName(name);
    if (!board) throw new NotFoundException('BOARD_NOT_FOUND');

    await this.checkBoardAccess(board, currentUserId);
    return this.getBoardWithTasks(board, currentUserId);
  }

  //get by options GET('')
  @Version('1')
  @Get()
  @Serialize(BoardOutputDto)
  async getBoardsByOptions(
    @CurrentUserId() currentUserId: string,
    @Query('ids') ids?: string[],
    @Query('group') group?: string,
  ) {
    const user = await this.eventCoordinatorService.getUserById(currentUserId);
    const options = { ids: ids ? ids : user.getBoards(), group };

    const boards =
      await this.eventCoordinatorService.getBoardsByOptions(options);
    if (!boards) {
      throw new NotFoundException('BOARDS_NOT_FOUND');
    }

    const validBoards = [];
    for (const board of boards) {
      try {
        await this.checkBoardAccess(board, currentUserId);
        validBoards.push(await this.getBoardWithTasks(board, currentUserId));
      } catch (error) {
        continue;
      }
    }

    return validBoards;
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

    await this.checkBoardAccess(board, currentUserId);
    return this.getBoardWithTasks(board, currentUserId);
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

  // Private methods

  /**
   * Checks if user has access to board
   */
  private async checkBoardAccess(
    board: BoardClass,
    userId: string,
  ): Promise<void> {
    if (board.getType() === BoardType.GROUP) {
      const group = await this.eventCoordinatorService.getGroupById(
        board.getGroup(),
      );
      if (!group) throw new NotFoundException('GROUP_NOT_FOUND');
      if (!group.getMembers().includes(userId)) {
        throw new ForbiddenException('GROUP_ACCESS_NOT_ALLOWED');
      }
    }

    if (board.getType() === BoardType.PERSONAL) {
      if (!board.getAdmins().includes(userId)) {
        throw new ForbiddenException('PERSONAL_BOARD_ACCESS_NOT_ALLOWED');
      }
    }
  }

  /**
   * Gets tasks for board and adds permissions information
   */
  private async getBoardWithTasks(board: BoardClass, userId: string) {
    const tasks = await this.eventCoordinatorService.getTasksByOptions({
      ids: [],
      group: '',
      board: board.id,
    });

    const sortedTasks = this.sortTasksByPriorityAndAssignee(tasks, userId);

    const tasksWithEditPermission = this.addEditPermissionsToTasks(
      sortedTasks,
      board,
      userId,
    );

    const boardWithMembers = await this.addMembersToBoard(board);

    return {
      ...boardWithMembers,
      tasks: tasksWithEditPermission,
    };
  }

  /**
   * Adds edit permissions to tasks
   */
  private addEditPermissionsToTasks(
    tasks: TaskClass[],
    board: BoardClass,
    userId: string,
  ) {
    return tasks.map((task) => ({
      ...task,
      canEdit:
        board.getAdmins().includes(userId) ||
        task.getAssignees().includes(userId),
    }));
  }

  /**
   * Sort tasks by priority and assignee
   */
  private sortTasksByPriorityAndAssignee(
    tasks: TaskClass[],
    currentUserId: string,
  ) {
    const getPriorityWeight = (priority: string) => {
      switch (priority) {
        case 'High':
          return 3;
        case 'Mid':
          return 2;
        case 'Low':
          return 1;
        default:
          return 0;
      }
    };

    return tasks.sort((a, b) => {
      const aHasUser = a.getAssignees().includes(currentUserId);
      const bHasUser = b.getAssignees().includes(currentUserId);

      if (aHasUser !== bHasUser) {
        return aHasUser ? -1 : 1;
      }

      const aPriority = getPriorityWeight(a.getPriority());
      const bPriority = getPriorityWeight(b.getPriority());

      return bPriority - aPriority;
    });
  }

  /**
   * Pobiera dane użytkowników i przekształca ich w obiekty Assignees
   */
  private async addMembersToBoard(board: BoardClass) {
    const adminIds = board.getAdmins();
    const admins = await Promise.all(
      adminIds.map(async (adminId) => {
        const user = await this.eventCoordinatorService.getUserById(adminId);
        if (!user) return null;
        return {
          id: user.id,
          name: user.getName(),
          avatar: user.getAvatar ? user.getAvatar() : '',
        };
      }),
    );

    const validAdmins = admins.filter((admin) => admin !== null);
    let members = [...validAdmins];
    let groupData = null;

    if (board.getType() === BoardType.GROUP && board.getGroup()) {
      const group = await this.eventCoordinatorService.getGroupById(
        board.getGroup(),
      );
      if (group) {
        groupData = {
          id: group.id,
          name: group.getName(),
        };

        const memberIds = group.getMembers();
        const nonAdminMemberIds = memberIds.filter(
          (memberId) => !adminIds.includes(memberId),
        );

        const groupMembers = await Promise.all(
          nonAdminMemberIds.map(async (memberId) => {
            const user =
              await this.eventCoordinatorService.getUserById(memberId);
            if (!user) return null;
            return {
              id: user.id,
              name: user.getName(),
              avatar: user.getAvatar ? user.getAvatar() : '',
            };
          }),
        );

        const validGroupMembers = groupMembers.filter(
          (member) => member !== null,
        );
        members = [...members, ...validGroupMembers];
      }
    }

    return {
      ...board,
      admins: validAdmins,
      members: members,
      group: groupData,
    };
  }
}
