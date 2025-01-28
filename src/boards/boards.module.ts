import { MongooseModule } from '@nestjs/mongoose';
import { Board, BoardSchema } from './schemes/board';
import { Module } from '@nestjs/common';
import { BoardController } from './boards.controller';
import { BoardService } from './boards.service';

@Module({
  controllers: [BoardController],
  imports: [
    MongooseModule.forFeature([{ name: Board.name, schema: BoardSchema }]),
  ],
  providers: [BoardService],
  exports: [BoardService],
})
export class BoardsModule {}
