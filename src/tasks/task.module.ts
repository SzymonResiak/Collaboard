import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './schemes/task';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { FileService } from '../common/services/file.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [TaskController],
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    ConfigModule,
  ],
  providers: [TaskService, FileService],
  exports: [TaskService],
})
export class TaskModule {}
