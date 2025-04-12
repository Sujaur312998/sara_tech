import {
  Injectable,
  Logger,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SendNowDto } from './dto/send-now.dto';
import { ScheduleSendDto } from './dto/schedule.dto';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectQueue('notification') private readonly notificationQueue: Queue,
  ) {}

  async sendNow(sendNowDto: SendNowDto) {
    try {
      const job = await this.notificationQueue.add('send-now', sendNowDto);
      this.logger.log(`Immediate notification job added: ${job.id}`);
      return {
        message: 'Notification enqueued for immediate sending',
        jobId: job.id,
      };
    } catch (error) {
      this.logger.error('Failed to enqueue immediate notification', error);

      throw new InternalServerErrorException(
        'Failed to enqueue immediate notification',
      );
    }
  }

  async schedule(scheduleDto: ScheduleSendDto) {
    try {
      const scheduleTime = new Date(scheduleDto.scheduleAt).getTime();
      const currentTime = Date.now();
      const delay = scheduleTime - currentTime;

      this.logger.debug(`Schedule time: ${scheduleDto.scheduleAt.toString()}`);
      this.logger.debug(`Delay: ${delay}ms`);

      if (isNaN(scheduleTime)) {
        this.logger.error('Invalid scheduleAt format');
        throw new BadRequestException('Invalid scheduleAt format');
      }

      if (delay < 0) {
        this.logger.warn(
          `Rejected scheduling: time in the past → ${scheduleDto.scheduleAt.toString()}`,
        );
        throw new ForbiddenException(
          'Cannot schedule notification in the past',
        );
      }

      const job = await this.notificationQueue.add('schedule', scheduleDto, {
        delay,
      });

      this.logger.log(`Scheduled notification job added: ${job.id}`);
      return {
        message: 'Notification scheduled successfully',
        jobId: job.id,
        delay,
      };
    } catch (error) {
      this.logger.error('Failed to schedule notification');

      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to schedule notification');
    }
  }
}
