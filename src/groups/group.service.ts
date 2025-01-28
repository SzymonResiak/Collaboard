import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Group } from './schemes/group';
import { Model } from 'mongoose';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(Group.name) private readonly groupModel: Model<Group>,
  ) {}

  // CREATE

  // UPDATE

  // DB UPLOAD - private

  // GET SINGLE - private

  // GET MANY - private

  // GET ALL

  // GET BY ID

  // GET BY IDS

  // GET BY OPTIONS

  // DELETE

  //privates
}
