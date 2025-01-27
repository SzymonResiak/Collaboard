import {
  Controller,
  Get,
  Version,
  Param,
  Post,
  BadRequestException,
  Patch,
  Body,
  NotFoundException,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EventCoordinatorService } from 'src/events/event-coordinator.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'; // TODO: implement
// import { AuthGuard } from 'src/auth/guards/auth.guard'; // TODO: implement
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { UserOutputDto } from './dto/output-user.dto';
import { UserCreateDto } from './dto/create-user.dto';
import { Types } from 'mongoose';
import { UserUpdateDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard.guard';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { UserClass } from './user.class';
import { CurrentUserId } from 'src/common/decorators/current-user-id.decorator';

@Controller('user')
@UseGuards(JwtAuthGuard, AuthGuard)
@ApiBearerAuth()
@ApiTags('user')
export class UserController {
  constructor(
    private readonly eventCoordinatorService: EventCoordinatorService,
  ) {}

  @Version('1')
  @Post()
  @Serialize(UserOutputDto)
  async createUserCtrl(@Body() userDto: UserCreateDto) {
    const user = await this.eventCoordinatorService.getUserByLogin(
      userDto.login,
    );
    if (user) throw new BadRequestException('USER_NAME_EXISTS'); // move to separate error constants

    const result = this.eventCoordinatorService.createUser(userDto);
    if (!result) throw new BadRequestException('USER_CREATE_FAILED');
    return result;
  }

  // @Version('1') only for development purposes, getAllUsers can be used in services only
  // TODO: add user #{id} where id will be 6 digit number. This will be used to fetch user that we want to add to our groups
  // @Get('all')
  // @Serialize(UserOutputDto)
  // async getAllUsersCtrl() {
  //   const users = await this.eventCoordinatorService.getAllUsers();
  //   return users;
  // }

  @Version('1')
  @Get(':id')
  @Serialize(UserOutputDto)
  async getUserCtrl(@Param('id') id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('INVALID_USER_ID');
    }

    const user = await this.eventCoordinatorService.getUserById(id);
    if (!user) throw new NotFoundException('USER_NOT_FOUND');

    return user;
  }

  /*
  returns all users that are in:
  - the specified group / current user's groups
  - the specified table / current user's tables
  - the specified ids
  - the current user
  */
  @Version('1')
  @Get()
  @Serialize(UserOutputDto)
  async getUsersByOptionsCtrl(
    @Query('groups') groups: string[],
    @Query('tables') tables: string[],
    @CurrentUser() currentUser: UserClass,
  ) {
    const user = await this.eventCoordinatorService.getUserById(currentUser.id);

    const options = {
      id: currentUser.id,
      groups: groups ?? user.getGroups(),
      tables: tables ?? user.getTables(),
    };
    const users = await this.eventCoordinatorService.getUsersByOptions(options);

    return users;
  }

  @Version('1')
  @Patch(':id')
  @Serialize(UserOutputDto)
  async updateUserCtrl(
    @Param('id') id: string,
    @Body() userDto: UserUpdateDto,
    @CurrentUserId() currentUserId: string,
  ) {
    if (currentUserId !== id)
      throw new BadRequestException('USER_UPDATE_NOT_ALLOWED');
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('INVALID_USER_ID');
    }

    const user = await this.eventCoordinatorService.getUserById(id);
    if (!user) throw new NotFoundException('USER_NOT_FOUND');

    const result = await this.eventCoordinatorService.updateUser({
      user,
      updates: userDto,
    });
    if (!result) throw new BadRequestException('USER_UPDATE_FAILED');

    return result;
  }

  @Version('1')
  @Put('/:id/delete')
  @Serialize(UserOutputDto)
  async deleteUserCtrl(
    @Param('id') id: string,
    @CurrentUserId() currentUserId: string,
  ) {
    if (currentUserId !== id) {
      throw new BadRequestException('USER_DELETE_NOT_ALLOWED');
    }

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('INVALID_USER_ID');
    }

    const user = await this.eventCoordinatorService.getUserById(id);
    if (!user) throw new NotFoundException('USER_NOT_FOUND');

    const result = await this.eventCoordinatorService.deleteUser(user);
    if (!result) throw new BadRequestException('USER_DELETE_FAILED');

    return result;
  }

  private filterUsersByGroupAndTable(
    users: UserClass[],
    group: string | string[],
    table: string,
    currentUser: UserClass,
  ): UserClass[] {
    return users.filter((user) => {
      if (user.id === currentUser.id) return true;
      if (table && user.getTables().includes(table)) return true;

      const hasGroupAccess =
        !group ||
        (Array.isArray(group)
          ? group.some((g) => user.getGroups().includes(g))
          : user.getGroups().includes(group));

      return hasGroupAccess;
    });
  }
}
