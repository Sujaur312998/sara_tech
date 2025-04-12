import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { UsersService } from 'src/users/users.service';
import { Logger } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { ScheduleSendDto } from '../dto/schedule.dto';
import { SendNowDto } from '../dto/send-now.dto';

@Processor('notification', {
  limiter: { duration: 500, max: 20 },
})
export class NotificationsWorker extends WorkerHost {
  private readonly logger = new Logger(NotificationsWorker.name);
  private readonly BATCH_SIZE = 500;

  constructor(
    private readonly usersService: UsersService,
    private firebaseService: FirebaseService,
  ) {
    super();
  }

  async process(job: Job<SendNowDto | ScheduleSendDto>) {
    const { title } = job.data;
    this.logger.log(`Starting job ${job.id}: ${title}`);

    try {
      const users = await this.usersService.findAll();
      if (!users || users.length === 0) {
        this.logger.warn(
          `Job ${job.id}: No users found to send notifications.`,
        );
        return { success: false, reason: 'No users available' };
      }

      const deviceTokens = users
        .map((user) => user.deviceToken)
        .filter(Boolean); // Remove null/undefined tokens

      if (deviceTokens.length === 0) {
        this.logger.warn(`Job ${job.id}: No valid device tokens found.`);
        return { success: false, reason: 'No valid device tokens' };
      }

      const totalUsers = deviceTokens.length;
      let processedCount = 0;

      for (let i = 0; i < totalUsers; i += this.BATCH_SIZE) {
        const batch = deviceTokens.slice(i, i + this.BATCH_SIZE);

        try {
          await this.processBatch(job.data, batch);
        } catch (batchError) {
          this.logger.error(
            `Job ${job.id} failed for batch ${i}-${i + batch.length}: ${
              (batchError as Error).message
            }`,
          );
          // Optionally: continue to next batch even if one fails
          continue;
        }

        processedCount += batch.length;
        await job.updateProgress(
          Math.round((processedCount / totalUsers) * 100),
        );
        this.logger.debug(
          `Processed batch ${i}-${i + batch.length} (${processedCount}/${totalUsers})`,
        );
      }

      this.logger.log(
        `Completed job ${job.id}: Sent to ${processedCount} users`,
      );
      return { success: true, count: processedCount };
    } catch (error) {
      this.logger.error(
        `Job ${job.id} failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  private async processBatch(
    jobData: SendNowDto | ScheduleSendDto,
    tokens: string[],
  ) {
    try {
      if (!tokens.length) {
        throw new Error('Empty token batch');
      }

      await this.firebaseService.sendPushNotificationToMultipleDevices(
        jobData,
        tokens,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send notification to batch: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  // Worker lifecycle events
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
    this.logger.error(`Job ${job?.id} failed: ${error.message}`, error.stack);
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job, progress: number) {
    this.logger.debug(`Job ${job.id} progress: ${progress}%`);
  }
}
