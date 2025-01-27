import { Injectable } from '@nestjs/common';
import { UserClass } from './user.class';
import { UserCreateDto } from './dto/create-user.dto';
import { User } from './schemes/user';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { OnEvent } from '@nestjs/event-emitter';
import * as Event from 'src/events/events';
import { UserUpdateDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  // CREATE
  @OnEvent(Event.USER_CREATE, { promisify: true })
  async createUser(obj: UserCreateDto): Promise<UserClass> {
    try {
      const user = new UserClass(obj);
      await user.setPasswd(obj.password);
      if (!user.isValid()) return;

      const userToCreate: User = new this.userModel(user.toMongoModel());
      const createdUser = await userToCreate.save();

      const result = new UserClass(createdUser);
      if (!result.isValid()) return;

      return result;
    } catch (error) {
      console.error('Error creating user', error);
      return;
    }
  }

  // UPDATE
  @OnEvent(Event.USER_UPDATE, { promisify: true })
  private async updateUser(options: {
    user: UserClass;
    updates: UserUpdateDto;
  }): Promise<UserClass> {
    const user = options.user;
    user.update(options.updates);
    if (!user.isValid()) return;

    return this.userDbUpdate(user);
  }

  // DB UPLOAD
  private async userDbUpdate(user: UserClass): Promise<UserClass> {
    try {
      const data = await this.userModel.findByIdAndUpdate(
        user.id,
        { $set: user.toMongoModel() },
        { new: true, runValidators: true },
      );

      const result = new UserClass(data);
      if (!result.isValid()) return;

      return result;
    } catch (error) {
      console.error(`Error with user while updating to DB`, error);
      return;
    }
  }

  // GET SINGLE
  private async getUserByFilter(
    filter?: any,
    select?: string,
  ): Promise<UserClass> {
    try {
      const query = this.userModel.findOne(filter);
      if (select) query.select(select);

      const data = await query;

      const user = new UserClass(data);
      if (!user.isValid()) return;

      return user;
    } catch (err) {
      console.error(`Error getting user by filter`, err);
      return;
    }
  }

  // GET MANY
  private async getUserListByFilter(
    filter?: any,
    select?: string,
  ): Promise<UserClass[]> {
    try {
      const query = this.userModel.find(filter);
      if (select) query.select(select);

      const data = await query;
      const result: UserClass[] = [];
      if (!Array.isArray(data)) return result;

      data.forEach((item: any) => {
        const user = new UserClass(item);
        if (user.isValid()) result.push(user);
      });

      return result;
    } catch (err) {
      console.error(`Error getting user list by filter`, err);
      return [];
    }
  }

  // GET ALL
  @OnEvent(Event.USER_GET_ALL, { promisify: true })
  private async getAllUsers(): Promise<UserClass[]> {
    return this.getUserListByFilter();
  }

  // GET BY LOGIN
  @OnEvent(Event.USER_GET_BY_LOGIN, { promisify: true })
  private async getUserByLogin(login: string): Promise<UserClass> {
    return this.getUserByFilter({ login: login });
  }

  // GET BY ID
  @OnEvent(Event.USER_GET_BY_ID, { promisify: true })
  private async getUserById(id: string): Promise<UserClass> {
    return this.getUserByFilter({ _id: id });
  }

  // GET BY IDS
  @OnEvent(Event.USER_GET_LIST_BY_IDS, { promisify: true })
  private async getUsersByIds(ids: string[]): Promise<UserClass[]> {
    return this.getUserListByFilter({ _id: { $in: ids } });
  }

  // GET BY OPTIONS
  @OnEvent(Event.USER_GET_LIST_BY_OPTIONS, { promisify: true })
  private async getUsersByOptions(options: {
    id: string;
    groups: string[];
    tables: string[];
  }): Promise<UserClass[]> {
    const filter = this.createUserFilter(options);
    return this.getUserListByFilter(filter);
  }

  // DELETE - not implemented yet
  //   @OnEvent(Event.USER_DELETE, { promisify: true })
  //   private async deleteUser(id: string): Promise<boolean> {
  //     try {
  //       await this.userModel.findByIdAndDelete(id);
  //       return true;
  //     } catch (err) {
  //       console.error(`Error deleting user`, err);
  //       return false;
  //     }
  //   }

  private createUserFilter(options: {
    id: string;
    groups: string[];
    tables: string[];
  }) {
    const filter: any = {};
    filter._id = options.id;

    if (options.groups && options.groups.length > 0) {
      filter.groups = { $in: options.groups };
    }

    if (options.tables && options.tables.length > 0) {
      filter.tables = { $in: options.tables };
    }

    return filter;
  }
}
