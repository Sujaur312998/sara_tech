import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';
import { ScheduleSendDto } from 'src/notification/dto/schedule.dto';
import { SendNowDto } from 'src/notification/dto/send-now.dto';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);

  constructor() {
    const serviceAccountPath = path.resolve(
      __dirname,
      `../../${process.env.firebase}`,
    );
    console.log(process.env.firebase);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath),
    });
  }

  async sendPushNotificationToMultipleDevices(
    job: SendNowDto | ScheduleSendDto,
    tokens: string[],
  ) {
    const { title, message } = job;
    const payload = {
      notification: {
        title,
        body: message,
      },
      data: {},
      tokens,
    };

    try {
      // send notification to multiple devices
      const response = await admin.messaging().sendEachForMulticast(payload);
      this.logger.log(
        `Successfully sent message: ${response.successCount} messages sent`,
      );
      this.logger.error(
        `Failed messages: ${response.failureCount} messages failed`,
      );
    } catch (error) {
      this.logger.error(
        `Error sending push notification: ${(error as Error).message}`,
      );
      throw error;
    }
  }
}
