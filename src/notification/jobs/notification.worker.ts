import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { UsersService } from 'src/users/users.service';
import { NotificationService } from '../notification.service';
import { Logger } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { ScheduleSendDto } from '../dto/schedule.dto';
import { SendNowDto } from '../dto/send-now.dto';

@Processor('notification', {
  limiter: { duration: 500, max: 20 },
  // concurrency: 20,
})
export class NotificationsWorker extends WorkerHost {
  private readonly logger = new Logger(NotificationsWorker.name);
  private readonly BATCH_SIZE = 500;

  constructor(
    private readonly usersService: UsersService,
    private readonly notificationService: NotificationService,
    private firebaseService: FirebaseService,
  ) {
    super();
  }

  async process(job: Job<{ title: string; message: string }>) {
    const { title } = job.data;
    this.logger.log(`Starting job ${job.id}: ${title}`);

    try {
      const users = await this.usersService.findAll();
      const deviceTokens = users.map((user) => user.deviceToken);
      const totalUsers = deviceTokens.length;
      let processedCount = 0;

      // Process in batches
      for (let i = 0; i < totalUsers; i += this.BATCH_SIZE) {
        const batch = deviceTokens.slice(i, i + this.BATCH_SIZE);

        await this.processBatch(job.data, batch);
        processedCount += batch.length;

        await job.updateProgress(
          Math.round((processedCount / totalUsers) * 100),
        );

        this.logger.debug(
          `Processed batch ${i}-${i + batch.length} (${processedCount}/${totalUsers})`,
        );
      }

      this.logger.log(`Completed job ${job.id}: Sent to ${totalUsers} users`);
      return { success: true, count: totalUsers };
    } catch (error) {
      this.logger.error(`Job ${job.id} failed: ${(error as Error).message}`);
      throw error;
    }
  }

  private async processBatch(
    job: SendNowDto | ScheduleSendDto,
    tokens: string[],
  ) {
    await this.firebaseService.sendPushNotificationToMultipleDevices(
      job,
      tokens,
    );
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.debug(`Job ${job.id} started processing`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job?.id} failed: ${error.message}`);
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job, progress: number) {
    this.logger.debug(`Job ${job.id} progress: ${progress}%`);
  }
}
