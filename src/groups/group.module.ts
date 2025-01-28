import { MongooseModule } from '@nestjs/mongoose';
import { Group, GroupSchema } from './schemes/group';
import { Module } from '@nestjs/common';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';

@Module({
  controllers: [GroupController],
  imports: [
    MongooseModule.forFeature([{ name: Group.name, schema: GroupSchema }]),
  ],
  providers: [GroupService],
  exports: [GroupService],
})
export class GroupModule {}
