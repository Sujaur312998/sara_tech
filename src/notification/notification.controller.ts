import { Body, Controller, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { SendNowDto } from './dto/send-now.dto';
import { ScheduleSendDto } from './dto/schedule.dto';

@Controller('push')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Post('send-now')
  sendNow(@Body() sendNowDto: SendNowDto) {
    return this.notificationService.sendNow(sendNowDto);
  }

  @Post('schedule')
  schedule(@Body() scheduleDto: ScheduleSendDto) {
    return this.notificationService.schedule(scheduleDto);
  }
}
