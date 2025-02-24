import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './schemes/task';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { FileService } from '../common/services/file.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TaskGateway } from '../gateways/task.gateway';
import { JwtModule } from '@nestjs/jwt';
import { WsJwtGuard } from '../common/guards/ws-jwt.guard';

@Module({
  controllers: [TaskController],
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    ConfigModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION', '24h'),
        },
      }),
    }),
  ],
  providers: [TaskService, FileService, TaskGateway, WsJwtGuard],
  exports: [TaskService, TaskGateway],
})
export class TaskModule {}
