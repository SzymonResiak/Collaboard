import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Version,
  BadRequestException,
  Query,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { TaskCreateDto } from './dto/create-task.dto';
import { OutputTaskDto } from './dto/output-task.dto';
import { Serialize } from '../common/interceptors/serialize.interceptor';
import { EventCoordinatorService } from '../events/event-coordinator.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { UserClass } from 'src/users/user.class';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard.guard';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { CurrentUserId } from 'src/common/decorators/current-user-id.decorator';
import { TaskUpdateDto } from './dto/update-task.dto';

@Controller('tasks')
@UseGuards(JwtAuthGuard, AuthGuard)
@ApiBearerAuth()
@ApiTags('tasks')
export class TaskController {
  constructor(private eventCoordinatorService: EventCoordinatorService) {}

  @Version('1')
  @Post()
  @Serialize(OutputTaskDto)
  async createTask(
    @Body() createTaskDto: TaskCreateDto,
    @CurrentUser() user: UserClass,
  ) {
    const result = await this.eventCoordinatorService.createTask({
      createdBy: user.id,
      ...createTaskDto,
    });
    if (!result) throw new Error('TASK_CREATE_FAILED');
    return result;
  }

  @Version('1')
  @Get('all')
  @Serialize(OutputTaskDto)
  async getAllTasks() {
    const tasks = await this.eventCoordinatorService.getAllTasks();
    return tasks;
  }

  @Version('1')
  @Get(':id')
  @Serialize(OutputTaskDto)
  async getTaskById(@Param('id') id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('INVALID_TASK_ID');
    }

    const task = await this.eventCoordinatorService.getTaskById(id);
    if (!task) throw new Error('TASK_NOT_FOUND');

    return task;
  }

  @Version('1')
  @Get()
  @Serialize(OutputTaskDto)
  async getTaskByOptions(
    @Query('ids') ids: string[],
    @Query('group') group: string,
    @Query('table') table: string,
  ) {
    const options = { ids, group, table };
    const tasks = await this.eventCoordinatorService.getTasksByOptions(options);

    return tasks;
  }

  @Version('1')
  @Patch(':id')
  @Serialize(OutputTaskDto)
  async updateTask(
    @Param('id') id: string,
    @Body() taskDto: TaskUpdateDto,
    @CurrentUserId() currentUserId: string,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('INVALID_TASK_ID');
    }

    const task = await this.eventCoordinatorService.getTaskById(id);
    if (!task) throw new Error('TASK_NOT_FOUND');

    if (
      currentUserId !== task.getCreatedBy() &&
      !task.getAssignees().includes(currentUserId)
    ) {
      throw new BadRequestException('TASK_UPDATE_NOT_ALLOWED');
    }

    const result = await this.eventCoordinatorService.updateTask({
      task,
      updates: taskDto,
    });
    if (!result) throw new Error('TASK_UPDATE_FAILED');

    return result;
  }

  //delete :id

  // @Version('1')
  // @Put('/:id/status')
  // async updateStatus(
  //   @Param('id') id: string,
  //   @Body('status') status: TaskStatus,
  // ): Promise<Task> {
  //   return this.eventCoordinatorService.updateTaskStatus(id, status);
  // }
}
