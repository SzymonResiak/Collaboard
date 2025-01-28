import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as Event from './events';
import { UserClass } from 'src/users/user.class';
import { UserUpdateDto } from 'src/users/dto/update-user.dto';
import { UserCreateDto } from 'src/users/dto/create-user.dto';
import { TaskClass } from 'src/tasks/task.class';
import { TaskUpdateDto } from 'src/tasks/dto/update-task.dto';
import { BoardClass } from '../boards/boards.class';

@Injectable()
export class EventCoordinatorService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  // TASK
  async createTask(task: any): Promise<TaskClass> {
    const result = (
      await this.eventEmitter.emitAsync(Event.TASK_CREATE, task)
    )[0];
    return result;
  }

  async updateTask(options: {
    task: TaskClass;
    updates: TaskUpdateDto;
  }): Promise<TaskClass> {
    const result = (
      await this.eventEmitter.emitAsync(Event.TASK_UPDATE, options)
    )[0];
    return result;
  }

  async getTaskById(id: string): Promise<TaskClass> {
    const result = (
      await this.eventEmitter.emitAsync(Event.TASK_GET_BY_ID, id)
    )[0];
    return result;
  }

  async getTasksByOptions(options: {
    ids: string[];
    group: string;
    table: string;
  }): Promise<TaskClass[]> {
    const result = (
      await this.eventEmitter.emitAsync(Event.TASK_GET_LIST_BY_OPTIONS, options)
    )[0];
    return result;
  }

  async getAllTasks(): Promise<any> {
    const result = (
      await this.eventEmitter.emitAsync(Event.TASK_GET_ALL, {})
    )[0];
    return result;
  }

  //   async updateTaskStatus(id: string, status: TaskStatus): Promise<any> {
  //     const result = (
  //       await this.eventEmitter.emitAsync(Event.TASK_STATUS_UPDATE, id, status)
  //     )[0];
  //     return result;
  //   }

  async deleteTask(data: any): Promise<any> {
    // return this.addEvent(TASK_EVENTS.DELETE, data); // not implemented yet
  }

  // USER
  async createUser(data: UserCreateDto): Promise<UserClass> {
    const result = (
      await this.eventEmitter.emitAsync(Event.USER_CREATE, data)
    )[0];
    return result;
  }

  async updateUser(options: {
    user: UserClass;
    updates: UserUpdateDto;
  }): Promise<UserClass> {
    const result = (
      await this.eventEmitter.emitAsync(Event.USER_UPDATE, options)
    )[0];
    return result;
  }

  async getAllUsers(): Promise<UserClass[]> {
    const result = (await this.eventEmitter.emitAsync(Event.USER_GET_ALL))[0];
    return result;
  }

  async getUserByLogin(login: string, select?: string): Promise<UserClass> {
    const result = (
      await this.eventEmitter.emitAsync(Event.USER_GET_BY_LOGIN, login, select)
    )[0];
    return result;
  }

  async getUserById(id: any, select?: string): Promise<UserClass> {
    const result = (
      await this.eventEmitter.emitAsync(Event.USER_GET_BY_ID, id, select)
    )[0];
    return result;
  }

  async getUserByIds(ids: string[]): Promise<UserClass[]> {
    const result = (
      await this.eventEmitter.emitAsync(Event.USER_GET_LIST_BY_IDS, [...ids])
    )[0];
    return result;
  }

  async getUsersByOptions(options: {
    id: string;
    groups: string[];
    tables: string[];
  }): Promise<UserClass[]> {
    const result = (
      await this.eventEmitter.emitAsync(Event.USER_GET_LIST_BY_OPTIONS, options)
    )[0];
    return result;
  }

  async deleteUser(data: any): Promise<any> {
    // return this.addEvent(USER_EVENTS.DELETE, data); // not implemented yet
  }

  // BOARD
  async createBoard(data: any): Promise<BoardClass> {
    const result = (
      await this.eventEmitter.emitAsync(Event.BOARD_CREATE, data)
    )[0];
    return result;
  }

  async updateBoard(data: any): Promise<BoardClass> {
    const result = (
      await this.eventEmitter.emitAsync(Event.BOARD_UPDATE, data)
    )[0];
    return result;
  }

  async getBoardById(id: string): Promise<BoardClass> {
    const result = (
      await this.eventEmitter.emitAsync(Event.BOARD_GET_BY_ID, id)
    )[0];
    return result;
  }

  async getBoardByOptions(options: {
    ids: string[];
    group: string;
  }): Promise<BoardClass[]> {
    const result = (
      await this.eventEmitter.emitAsync(
        Event.BOARD_GET_LIST_BY_OPTIONS,
        options,
      )
    )[0];
    return result;
  }

  async deleteBoard(data: any): Promise<any> {
    // return;
  }
}
