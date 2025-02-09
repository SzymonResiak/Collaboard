import { Global, Module } from '@nestjs/common';
import { EventCoordinatorService } from './event-coordinator.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { FileService } from '../common/services/file.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [EventEmitterModule.forRoot(), ConfigModule],
  providers: [EventCoordinatorService, FileService],
  exports: [EventCoordinatorService],
})
export class EventCoordinatorModule {}
