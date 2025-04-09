import { Injectable } from '@nestjs/common';
import { SendNowDto } from './dto/send-now.dto';
import { ScheduleSendDto } from './dto/schedule.dto';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class NotificationService {
  constructor(
    @InjectQueue('notification') private readonly notificationQueue: Queue,
  ) {}

  async sendNow(sendNowDto: SendNowDto) {
    return await this.notificationQueue.add('send-now', sendNowDto);
  }
  async schedule(scheduleDto: ScheduleSendDto) {
    return await this.notificationQueue.add('schedule', scheduleDto);
  }
}
