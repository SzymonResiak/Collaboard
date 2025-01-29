import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Version,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard.guard';
import { EventCoordinatorService } from 'src/events/event-coordinator.service';
import { GroupOutputDto } from './dto/output-group';
import { GroupCreateDto } from './dto/create-group';
import { CurrentUserId } from 'src/common/decorators/current-user-id.decorator';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { Types } from 'mongoose';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';

@Controller('groups')
@UseGuards(JwtAuthGuard, AuthGuard)
@ApiBearerAuth()
@ApiTags('groups')
export class GroupController {
  constructor(private eventCoordinatorService: EventCoordinatorService) {}

  //create group POST('')
  @Version('1')
  @Post()
  @Serialize(GroupOutputDto)
  async createGroupCtrl(
    @Body() groupDto: GroupCreateDto,
    @CurrentUserId() currentUserId: string,
  ) {
    const result = await this.eventCoordinatorService.createGroup({
      createdBy: currentUserId, //make sure hes saved in admins[]
      ...groupDto,
    });
    if (!result) throw new Error('GROUP_CREATE_FAILED');
    return result;
  }

  //get all GET('all')'
  // @Version('1')
  // @Get('all')
  // @Serialize(GroupOutputDto)
  // async getAllGroups() {
  //   const groups = await this.eventCoordinatorService.getAllGroups();
  //   if (!groups) throw new Error('GROUPS_NOT_FOUND');
  //   return groups;
  // }

  //get by id GET(':id')
  @Version('1')
  @Get(':id')
  @Serialize(GroupOutputDto)
  async getGroupById(@Param('id') id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('INVALID_GROUP_ID');
    }
    const group = await this.eventCoordinatorService.getGroupById(id);
    if (!group) throw new Error('GROUP_NOT_FOUND');
    return group;
  }

  //get by options GET('')
  @Version('1')
  @Get()
  @Serialize(GroupOutputDto)
  async getGroupsByOptions(
    @Body('ids') ids: string[],
    @Body('board') board: string,
  ) {
    const options = { ids, board };
    const groups = await this.eventCoordinatorService.getGroupsByOptions(options);
    if (!groups) throw new Error('GROUPS_NOT_FOUND');

    return groups;
  }

  //update group PATCH(':id')
  @Version('1')
  @Patch(':id')
  @Serialize(GroupOutputDto)
  async updateGroupCtrl(
    @Param('id') id: string,
    @Body() groupDto: GroupCreateDto,
    @CurrentUserId() currentUserId: string,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('INVALID_GROUP_ID');
    }
    const group = await this.eventCoordinatorService.getGroupById(id);
    if (!group) throw new Error('GROUP_NOT_FOUND');

    if (currentUserId !== group.getCreatedBy()) {
      throw new BadRequestException('GROUP_UPDATE_NOT_ALLOWED');
    }

    const result = await this.eventCoordinatorService.updateGroup({
      group,
      updates: groupDto,
    });
    if (!result) throw new Error('GROUP_UPDATE_FAILED');
    return result;
  }

  //delete group DELETE(':id')
}
