import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard.guard';
import { EventCoordinatorService } from 'src/events/event-coordinator.service';

@Controller('groups')
@UseGuards(JwtAuthGuard, AuthGuard)
@ApiBearerAuth()
@ApiTags('groups')
export class GroupController {
  constructor(private eventCoordinatorService: EventCoordinatorService) {}

  //create group POST('')

  //get all GET('all')

  //get by id GET(':id')

  //get by options GET('')

  //update group PATCH(':id')

  //delete group DELETE(':id')
}
