import { InjectModel } from '@nestjs/mongoose';
import { Board } from './schemes/board';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BoardService {
  constructor(
    @InjectModel(Board.name) private readonly boardModel: Model<Board>,
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
