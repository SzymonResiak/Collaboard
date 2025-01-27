import { Injectable } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { TaskCreatedEvent } from './task-created.event';

@Injectable()
@EventsHandler(TaskCreatedEvent)
export class TaskCreatedEventHandler implements IEventHandler<TaskCreatedEvent> {
    handle(event: TaskCreatedEvent) {
        console.log(`Task created: ${event.title} (ID: ${event.taskId})`);
    }
}