import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notification',
    }),
    UsersModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
