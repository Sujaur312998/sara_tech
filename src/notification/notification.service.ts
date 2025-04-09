import { Injectable, Logger } from '@nestjs/common';
import { SendNowDto } from './dto/send-now.dto';
import { ScheduleSendDto } from './dto/schedule.dto';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { User } from 'src/entity/user.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  constructor(
    @InjectQueue('notification') private readonly notificationQueue: Queue,
  ) {}

  async sendNow(sendNowDto: SendNowDto) {
    return await this.notificationQueue.add('send-now', sendNowDto);
  }
  async schedule(scheduleDto: ScheduleSendDto) {
    const delay = new Date(scheduleDto.scheduleAt).getTime() - Date.now();
    console.log(scheduleDto.scheduleAt);
    console.log(new Date(scheduleDto.scheduleAt).getTime());
    console.log(delay);

    return await this.notificationQueue.add('schedule', scheduleDto, { delay });
  }

  sendImmediateNotification(user: User, data: SendNowDto) {
    this.logger.log(
      `${data.title} sending notification to ${user.deviceToken}`,
    );
  }
}
