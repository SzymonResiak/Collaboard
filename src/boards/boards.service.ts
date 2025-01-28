import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { OnEvent } from '@nestjs/event-emitter';
import * as Event from '../events/events';
import { BoardCreateDto } from './dto/create-board.dto';
import { BoardClass } from './boards.class';
import { Board } from './schemes/board';
import { BoardUpdateDto } from './dto/update-boards';


@Injectable()
export class BoardService {
  constructor(
    @InjectModel(Board.name) private readonly boardModel: Model<Board>,
  ) {}

  // CREATE
  @OnEvent(Event.BOARD_CREATE, { promisify: true })
  async createBoard(obj: BoardCreateDto): Promise<BoardClass> {
    try {
      const board = new BoardClass(obj);
      if (!board.isValid()) return;

      const boardToCreate: Board = new this.boardModel(board.toMongoModel());
      const createBoard = await boardToCreate.save();

      const result = new BoardClass(createBoard);
      if (!result.isValid()) return;

      return result;
    } catch (error) {
      console.error(`Error creating board`, error);
      return;
    }
  }

  // UPDATE
  @OnEvent(Event.BOARD_UPDATE, { promisify: true })
  async updateBoard(options: {
    board: BoardClass;
    updates: BoardUpdateDto;
  }): Promise<BoardClass> {
    const board = options.board;
    board.update(options.updates);
    if (!board.isValid()) return;

    return this.boardDbUpdate(board);
  }

  // DB UPLOAD - private
  private async boardDbUpdate(board: BoardClass): Promise<BoardClass> {
    try {
      const data = await this.boardModel.findByIdAndUpdate(
        board.id,
        { $set: board.toMongoModel() },
        { new: true, runValidators: true },
      );

      const result = new BoardClass(data);
      if (!result.isValid()) return;

      return result;
    } catch (error) {
      console.error(`Error updating board`, error);
      return;
    }
  }

  // GET SINGLE - private
  private async getBoardByFilter(
    filter?: any,
    select?: string,
  ): Promise<BoardClass> {
    try {
      const query = this.boardModel.findOne(filter);
      if (select) query.select(select);

      const data = await query;

      const result = new BoardClass(data);
      if (!result.isValid()) return;
    } catch (error) {
      console.error(`Error getting board by filter`, error);
      return;
    }
  }

  // GET MANY - private
  private async getBoardListByFilter(
    filter?: any,
    select?: string,
  ): Promise<BoardClass[]> {
    try {
      const query = this.boardModel.find(filter);
      if (select) query.select(select);

      const data = await query;
      const result: BoardClass[] = [];
      data.forEach((board) => {
        const boardClass = new BoardClass(board);
        if (boardClass.isValid()) result.push(boardClass);
      });

      return result;
    } catch (error) {
      console.error(`Error getting board by filter`, error);
      return;
    }
  }

  // GET ALL
  @OnEvent(Event.BOARD_GET_ALL, { promisify: true })
  async getAllBoards(): Promise<BoardClass[]> {
    return this.getBoardListByFilter();
  }

  // GET BY ID
  @OnEvent(Event.BOARD_GET_BY_ID, { promisify: true })
  async getBoardById(id: string): Promise<BoardClass> {
    return this.getBoardByFilter({ _id: id });
  }

  // GET BY IDS
  @OnEvent(Event.BOARD_GET_LIST_BY_IDS, { promisify: true })
  async getBoardByIds(ids: string[]): Promise<BoardClass[]> {
    return this.getBoardListByFilter({ _id: { $in: ids } });
  }

  // GET BY OPTIONS
  @OnEvent(Event.BOARD_GET_LIST_BY_OPTIONS, { promisify: true })
  async getBoardsByOptions(options: {
    ids: string[];
    group: string;
  }): Promise<BoardClass[]> {
    const filter = this.createBoardFilter(options);
    return this.getBoardListByFilter(filter);
  }

  // DELETE
  // @OnEvent(Event.BOARD_DELETE, { promisify: true })

  //privates
  private createBoardFilter(options: {
    ids: string[];
    group: string;
  }): any {
    const filter: any = {};

    if (options.ids) filter._id = { $in: options.ids };
    if (options.group) filter.group = options.group;

    return filter;
  }
}
