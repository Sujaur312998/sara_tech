/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  Logger,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SendNowDto } from './dto/send-now.dto';
import { ScheduleSendDto } from './dto/schedule.dto';
import { Job, Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { ScheduleNotification } from 'src/entity/schedule_notification.entity';
import { Repository } from 'typeorm';
import { UpdateScheduleSendDto } from './dto/updateSchedule.dto';
import { User } from 'src/entity/user.entity';
import { UpdateNotification } from 'src/entity/update_notification.entity';

interface ScheduleJobData {
  title: string;
  message: string;
  scheduleAt: Date;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectQueue('notification') private readonly notificationQueue: Queue,
    @InjectRepository(ScheduleNotification)
    private readonly scheduleNotificationRepository: Repository<ScheduleNotification>,
    @InjectRepository(UpdateNotification)
    private readonly updateNotificationRepository: Repository<UpdateNotification>,
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

      const userIds = scheduleDto.userIds;

      try {
        if (!userIds || userIds.length === 0) {
          const createNotification = this.scheduleNotificationRepository.create(
            {
              jobId: job.id,
            },
          );
          await this.scheduleNotificationRepository.save(createNotification);
        } else {
          await this.scheduleNotificationRepository.insert(
            userIds.map((userId) => ({
              jobId: job.id,
              userId,
            })),
          );
        }
      } catch (err) {
        this.logger.error('Notification insert failed', err);
        throw new InternalServerErrorException(
          'Failed to insert notifications in DB',
        );
      }

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

  async updateSchedule(updateScheduleDto: UpdateScheduleSendDto) {
    const { jobId, new_title, new_message, new_scheduleAt } = updateScheduleDto;

    try {
      const scheduleTime = new Date(new_scheduleAt).getTime();
      if (isNaN(scheduleTime)) {
        throw new BadRequestException('Invalid scheduleAt date format');
      }
      const currentTime = Date.now();
      const newDelay = scheduleTime - currentTime;

      if (newDelay < 0) {
        this.logger.warn(
          `Rejected scheduling: time in the past → ${new_scheduleAt.toISOString()}`,
        );
        throw new ForbiddenException(
          'Cannot schedule notification in the past',
        );
      }

      const existingJob: Job<ScheduleJobData> | null =
        await this.notificationQueue.getJob(jobId);

      if (!existingJob) {
        throw new NotFoundException(`Job with ID ${jobId} not found`);
      }

      const hoursUntilSchedule = Math.floor(newDelay / 3600000);

      if (hoursUntilSchedule >= 6) {
        const existing = await this.updateNotificationRepository.findOne({
          where: { jobId: jobId },
        });
        if (existing) {
          await this.updateNotificationRepository.update(
            { jobId: jobId },
            {
              new_title,
              new_message,
              new_scheduleAt,
            },
          );
        } else {
          await this.updateNotificationRepository.save(updateScheduleDto);
        }
      } else {
        const { title, message, scheduleAt }: ScheduleJobData =
          existingJob.data;
        await existingJob.remove();
        const newJob = await this.notificationQueue.add(
          'schedule',
          {
            title: new_title ? new_title : title,
            message: new_message ? new_message : message,
            scheduleAt,
          },
          { delay: newDelay },
        );
        await this.scheduleNotificationRepository.update(
          { jobId: jobId },
          { jobId: newJob.id },
        );

        this.logger.log(
          `Rescheduled notification with new jobId: ${newJob.id}`,
        );

        return {
          message: 'Notification rescheduled successfully',
          newJobId: newJob.id,
          delay: newDelay,
        };
      }
    } catch (error) {
      this.logger.error('Failed to reschedule notification', error);

      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to reschedule notification',
      );
    }
  }

  async notificationUserToken(jobId: string): Promise<User[]> {
    const notifications = await this.scheduleNotificationRepository.find({
      where: { jobId },
      relations: ['user'],
    });

    return notifications
      .map((n) => n.user)
      .filter((u): u is User => !!u && !!u.deviceToken);
  }
}
