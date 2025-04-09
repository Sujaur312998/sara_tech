import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { UsersService } from 'src/users/users.service';
import { NotificationService } from '../notification.service';
import { Logger } from '@nestjs/common';

@Processor('notification', {
  limiter: { duration: 500, max: 2 },
  concurrency: 10,
})
export class NotificationsWorker extends WorkerHost {
  private readonly logger = new Logger(NotificationsWorker.name);
  private readonly BATCH_SIZE = 500; // Optimal batch size for FCM

  constructor(
    private readonly usersService: UsersService,
    private readonly notificationService: NotificationService,
  ) {
    super();
  }

  async process(job: Job<{ title: string; message: string }>) {
    const { title, message } = job.data;
    this.logger.log(`Starting job ${job.id}: ${title}`);

    try {
      // Get all users (in a real app, consider streaming/pagination)
      const users = await this.usersService.findAll();
      const totalUsers = users.length;
      let processedCount = 0;

      // Process in batches
      for (let i = 0; i < totalUsers; i += this.BATCH_SIZE) {
        const batch = users.slice(i, i + this.BATCH_SIZE);

        await this.processBatch(job, batch, title, message);
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
    job: Job,
    batch: any[],
    title: string,
    message: string,
  ) {
    try {
      // Use Promise.allSettled to continue even if some fail
      const results = await Promise.allSettled(
        batch.map((user) =>
          this.notificationService.sendImmediateNotification(user, {
            title,
            message,
          }),
        ),
      );

      // Handle failures
      const failures = results.filter((r) => r.status === 'rejected');
      if (failures.length > 0) {
        this.logger.warn(
          `Job ${job.id}: ${failures.length}/${batch.length} failed in batch`,
        );
        // Optionally log or handle individual failures
      }
    } catch (error) {
      this.logger.error(`Batch processing failed: ${(error as Error).message}`);
      throw error;
    }
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
