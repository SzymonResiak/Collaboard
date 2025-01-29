import { Module } from '@nestjs/common';
import { TaskModule } from './tasks/task.module';
import { CommonModule } from './common/common.module';
import { UserModule } from './users/user.module';
import { EventCoordinatorModule } from './events/event-coordinator.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { GroupModule } from './groups/group.module';
import { BoardModule } from './boards/boards.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    CommonModule,
    TaskModule,
    UserModule,
    GroupModule,
    BoardModule,
    EventCoordinatorModule,
    AuthModule,
  ],
})
export class AppModule {}
