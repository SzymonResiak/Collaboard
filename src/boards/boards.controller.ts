import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard.guard';
import { EventCoordinatorService } from 'src/events/event-coordinator.service';

@Controller('boards')
@UseGuards(JwtAuthGuard, AuthGuard)
@ApiBearerAuth()
@ApiTags('boards')
export class BoardController {
  constructor(private eventCoordinatorService: EventCoordinatorService) {}

  //create board POST('')

  //get all GET('all')

  //get by id GET(':id')

  //get by options GET('')

  //update board PATCH(':id')

  //delete board DELETE(':id')
}
