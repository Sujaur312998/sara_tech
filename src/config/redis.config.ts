import { ConfigService } from '@nestjs/config';
import { BullRootModuleOptions } from '@nestjs/bullmq';

export const redisConfig = (
  configService: ConfigService,
): BullRootModuleOptions => ({
  connection: {
    host: configService.get<string>('REDIS_HOST'),
    port: configService.get<number>('REDIS_PORT'),
  },
  defaultJobOptions: {
    attempts: 3,
    removeOnComplete: 5000,
    removeOnFail: 100000,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});
