import { Global, Module } from '@nestjs/common';
import { EventCoordinatorService } from './event-coordinator.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Global()
@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [EventCoordinatorService],
  exports: [EventCoordinatorService],
})
export class EventCoordinatorModule {}
