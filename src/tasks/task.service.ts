import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from './schemes/task';
import { OnEvent } from '@nestjs/event-emitter';
import * as Event from '../events/events';
import { TaskCreateDto } from './dto/create-task.dto';
import { TaskClass } from './task.class';
import { TaskUpdateDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
  ) {}

  // CREATE
  @OnEvent(Event.TASK_CREATE, { promisify: true })
  async createTask(obj: TaskCreateDto): Promise<TaskClass> {
    try {
      const task = new TaskClass(obj);
      if (!task.isValid()) return;

      const taskToCreate: Task = new this.taskModel(task.toMongoModel());
      const createdTask = await taskToCreate.save();

      const result = new TaskClass(createdTask);
      if (!result.isValid()) return;

      return result;
    } catch (error) {
      console.error('Error creating task', error);
      return;
    }
  }

  // UPDATE
  @OnEvent(Event.TASK_UPDATE, { promisify: true })
  private async updateTask(options: {
    task: TaskClass;
    updates: TaskUpdateDto;
  }): Promise<any> {
    const task = options.task;
    task.update(options.updates);
    if (!task.isValid()) return;

    return this.taskDbUpdate(task);
  }

  // DB UPLOAD
  private async taskDbUpdate(task: TaskClass): Promise<TaskClass> {
    try {
      const data = await this.taskModel.findByIdAndUpdate(
        task.id,
        { $set: task.toMongoModel() },
        { new: true, runValidators: true },
      );

      const result = new TaskClass(data);
      if (!result.isValid()) return;

      return result;
    } catch (error) {
      console.error('Error updating task', error);
      return;
    }
  }
  // GET SINGLE
  private async getTaskByFilter(
    filter: any,
    select?: string,
  ): Promise<TaskClass> {
    try {
      const query = this.taskModel.findOne(filter);
      if (select) query.select(select);

      const data = await query;

      const result = new TaskClass(data);
      if (!result.isValid()) return;

      return result;
    } catch (error) {
      console.error('Error getting task by filter', error);
      return;
    }
  }

  // GET MANY
  private async getTaskListByFilter(
    filter?: any,
    select?: string,
  ): Promise<TaskClass[]> {
    try {
      const query = this.taskModel.find(filter);
      if (select) query.select(select);

      const data = await query;
      const result: TaskClass[] = [];
      data.forEach((task) => {
        const taskClass = new TaskClass(task);
        if (taskClass.isValid()) result.push(taskClass);
      });

      return result;
    } catch (error) {
      console.error('Error getting task list by filter', error);
      return;
    }
  }

  // GET ALL
  @OnEvent(Event.TASK_GET_ALL, { promisify: true })
  async getAllTasks(): Promise<TaskClass[]> {
    return this.getTaskListByFilter();
  }

  // GET BY ID
  @OnEvent(Event.TASK_GET_BY_ID, { promisify: true })
  async getTaskById(id: string): Promise<TaskClass> {
    return this.getTaskByFilter({ _id: id });
  }

  // GET BY IDS
  @OnEvent(Event.TASK_GET_LIST_BY_IDS, { promisify: true })
  async getTasksByIds(ids: string[]): Promise<TaskClass[]> {
    return this.getTaskListByFilter({ _id: { $in: ids } });
  }

  // GET BY OPTIONS
  @OnEvent(Event.TASK_GET_LIST_BY_OPTIONS, { promisify: true })
  async getTasksByOptions(options: {
    ids: string[];
    group: string;
    table: string;
  }): Promise<TaskClass[]> {
    const filter = this.createTaskFilter(options);
    return this.getTaskListByFilter(filter);
  }

  // DELETE
  //   @OnEvent(Event.TASK_STATUS_UPDATE, { promisify: true })
  //   async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  //     return this.taskModel
  //       .findByIdAndUpdate(id, { status }, { new: true })
  //       .exec();
  //   }

  private createTaskFilter(options: {
    ids: string[];
    group: string;
    table: string;
  }): any {
    const filter: any = {};

    if (options.ids) filter._id = { $in: options.ids };
    if (options.group) filter.group = options.group;
    if (options.table) filter.table = options.table;

    return filter;
  }
}
