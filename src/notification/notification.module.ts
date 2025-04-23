import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { UsersModule } from '../users/users.module';
import { NotificationsWorker } from './jobs/notification.worker';
import { FirebaseModule } from '../firebase/firebase.module';
import { ScheduleNotification } from 'src/entity/schedule_notification.entity';
import { User } from '../entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UpdateNotification } from 'src/entity/update_notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScheduleNotification, UpdateNotification, User]),
    BullModule.registerQueue({
      name: 'notification',
    }),
    UsersModule,
    FirebaseModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationsWorker],
})
export class NotificationModule {}
