import {
  Controller,
  Post,
  Request,
  UseGuards,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserCreateDto } from 'src/users/dto/create-user.dto';
import { EventCoordinatorService } from 'src/events/event-coordinator.service';

@Controller('auth')
@ApiBearerAuth()
@ApiTags('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly eventCoordinatorService: EventCoordinatorService,
  ) {}

  @Post('signin')
  @UseGuards(LocalAuthGuard)
  async signIn(@Request() req: any) {
    return this.authService.signIn(req.user);
  }

  @Post('signup')
  async signUp(@Body() userDto: UserCreateDto) {
    const user = await this.eventCoordinatorService.getUserByLogin(
      userDto.login,
    );
    if (user) throw new BadRequestException('USER_NAME_EXISTS');

    const result = await this.eventCoordinatorService.createUser(userDto);
    if (!result) throw new BadRequestException('USER_CREATE_FAILED');
    return result;
  }
}
