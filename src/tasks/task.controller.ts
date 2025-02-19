import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Version,
  BadRequestException,
  Patch,
  UseGuards,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  Delete,
} from '@nestjs/common';
import { TaskCreateDto } from './dto/create-task.dto';
import { TaskOutputDto } from './dto/output-task.dto';
import { Serialize } from '../common/interceptors/serialize.interceptor';
import { EventCoordinatorService } from '../events/event-coordinator.service';
import { ApiBearerAuth, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { UserClass } from 'src/users/user.class';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard.guard';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { CurrentUserId } from 'src/common/decorators/current-user-id.decorator';
import { TaskUpdateDto } from './dto/update-task.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe';
import { ParseFilePipe } from '@nestjs/common';
import { MaxFileSizeValidator } from 'src/common/validators/max-file-size.validator';
import { FileTypeValidator } from 'src/common/validators/file-type.validator';
import { TaskGateway } from './task.gateway';

@Controller('tasks')
@UseGuards(JwtAuthGuard, AuthGuard)
@ApiBearerAuth()
@ApiTags('tasks')
export class TaskController {
  constructor(
    private eventCoordinatorService: EventCoordinatorService,
    private taskGateway: TaskGateway,
  ) {}

  @Version('1')
  @Post()
  @Serialize(TaskOutputDto)
  async createTask(
    @Body() createTaskDto: TaskCreateDto,
    @CurrentUser() user: UserClass,
  ) {
    const result = await this.eventCoordinatorService.createTask({
      createdBy: user.id,
      assignees: [user.id],
      ...createTaskDto,
    });
    if (!result) throw new BadRequestException('TASK_CREATE_FAILED');

    // Emituj aktualizację tablicy po dodaniu nowego taska
    this.taskGateway.emitTaskUpdate(result.getBoard(), result, 'CREATE');

    return result;
  }

  // @Version('1')
  // @Get('all')
  // @Serialize(TaskOutputDto)
  // async getAllTasks() {
  //   const tasks = await this.eventCoordinatorService.getAllTasks();
  //   return tasks;
  // }

  @Version('1')
  @Get(':id')
  @Serialize(TaskOutputDto)
  async getTaskById(@Param('id') id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('INVALID_TASK_ID');
    }

    const task = await this.eventCoordinatorService.getTaskById(id);
    if (!task) throw new NotFoundException('TASK_NOT_FOUND');

    return task;
  }

  @Version('1')
  @Get()
  @Serialize(TaskOutputDto)
  async getTasksByOptions(
    @Body('ids') ids: string[],
    @Body('group') group: string,
    @Body('board') board: string,
  ) {
    const options = { ids, group, board };
    const tasks = await this.eventCoordinatorService.getTasksByOptions(options);
    if (!tasks) throw new NotFoundException('TASK_NOT_FOUND');

    return tasks;
  }

  @Version('1')
  @Patch(':id')
  @Serialize(TaskOutputDto)
  async updateTask(
    @Param('id') id: string,
    @Body() taskDto: TaskUpdateDto,
    @CurrentUserId() currentUserId: string,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('INVALID_TASK_ID');
    }

    const task = await this.eventCoordinatorService.getTaskById(id);
    if (!task) throw new NotFoundException('TASK_NOT_FOUND');

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
    if (!result) throw new BadRequestException('TASK_UPDATE_FAILED');

    // Emituj aktualizację tablicy po zmianie taska
    this.taskGateway.emitTaskUpdate(result.getBoard(), result, 'UPDATE');

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

  @Post(':taskId/attachments')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async addAttachment(
    @Param('taskId', new ParseObjectIdPipe()) taskId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @CurrentUserId() userId: string,
  ) {
    return this.eventCoordinatorService.addAttachment(taskId, file, userId);
  }

  @Delete(':taskId/attachments/:attachmentId')
  async removeAttachment(
    @Param('taskId') taskId: string,
    @Param('attachmentId') attachmentId: string,
  ) {
    return this.eventCoordinatorService.removeAttachment(taskId, attachmentId);
  }
}
