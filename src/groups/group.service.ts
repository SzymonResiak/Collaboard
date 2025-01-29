import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Group } from './schemes/group';
import { Model } from 'mongoose';
import { OnEvent } from '@nestjs/event-emitter';
import * as Event from '../events/events';
import { GroupClass } from './group.class';
import { GroupCreateDto } from './dto/create-group';
import { GroupUpdateDto } from './dto/update-group';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(Group.name) private readonly groupModel: Model<Group>,
  ) {}

  // CREATE
  @OnEvent(Event.GROUP_CREATE, { promisify: true })
  async createGroup(obj: GroupCreateDto): Promise<GroupClass> {
    try {
      const group = new GroupClass(obj);
      if (!group.isValid()) return;

      const groupToCreate: Group = new this.groupModel(group.toMongoModel());
      const createGroup = await groupToCreate.save();

      const result = new GroupClass(createGroup);
      if (!result.isValid()) return;

      return result;
    } catch (error) {
      console.error(`Error creating group`, error);
      return;
    }
  }

  // UPDATE
  @OnEvent(Event.GROUP_UPDATE, { promisify: true })
  async updateGroup(options: {
    group: GroupClass;
    updates: GroupUpdateDto;
  }): Promise<GroupClass> {
    const group = options.group;
    group.update(options.updates);
    if (!group.isValid()) return;

    return this.groupDbUpdate(group);
  }

  // DB UPLOAD - private
  private async groupDbUpdate(group: GroupClass): Promise<GroupClass> {
    try {
      const data = await this.groupModel.findByIdAndUpdate(
        group.id,
        { $set: group.toMongoModel() },
        { new: true, runValidators: true },
      );

      const result = new GroupClass(data);
      if (!result.isValid()) return;

      return result;
    } catch (error) {
      console.error(`Error updating group`, error);
      return;
    }
  }

  // GET SINGLE - private
  private async getGroupByFilter(
    filter?: any,
    select?: string,
  ): Promise<GroupClass> {
    try {
      const query = this.groupModel.findOne(filter);
      if (select) query.select(select);

      const data = await query;

      const result = new GroupClass(data);
      if (!result.isValid()) return;

      return result;
    } catch (error) {
      console.error(`Error getting group by filter`, error);
      return;
    }
  }
  // GET MANY - private
  private async getGroupListByFilter(
    filter?: any,
    select?: string,
  ): Promise<GroupClass[]> {
    try {
      const query = this.groupModel.find(filter);
      if (select) query.select(select);

      const data = await query;

      const result: GroupClass[] = [];
      data.forEach((group) => {
        const groupClass = new GroupClass(group);
        if (groupClass.isValid()) {
          result.push(groupClass);
        }
      });

      return result;
    } catch (error) {
      console.error(`Error getting group list by filter`, error);
      return;
    }
  }

  // GET ALL
  @OnEvent(Event.GROUP_GET_ALL, { promisify: true })
  async getAllGroups(): Promise<GroupClass[]> {
    return this.getGroupListByFilter();
  }

  // GET BY ID
  @OnEvent(Event.GROUP_GET_BY_ID, { promisify: true })
  async getGroupById(id: string): Promise<GroupClass> {
    return this.getGroupByFilter({ _id: id });
  }

  // GET BY IDS
  @OnEvent(Event.GROUP_GET_LIST_BY_IDS, { promisify: true })
  async getGroupByIds(ids: string[]): Promise<GroupClass[]> {
    return this.getGroupListByFilter({ _id: { $in: ids } });
  }

  // GET BY OPTIONS
  @OnEvent(Event.GROUP_GET_BY_OPTIONS, { promisify: true })
  async getGroupByOptions(options: {
    ids: string[];
    board: string;
  }): Promise<GroupClass[]> {
    const filter = this.createGroupFilter(options);
    return this.getGroupListByFilter(filter);
  }

  // DELETE

  //privates
  private createGroupFilter(options: { ids: string[]; board: string }) {
    const filter: any = {};

    if (options.ids) filter._id = { $in: options.ids };
    if (options.board) filter.board = options.board;

    return filter;
  }
}
