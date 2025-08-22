import { Module } from '@nestjs/common';
import { OpHubSendNotificationService } from './op-hub-send-notification.service';
import { OpHubSendNotificationController } from './op-hub-send-notification.controller';

@Module({
  controllers: [OpHubSendNotificationController],
  providers: [OpHubSendNotificationService],
})
export class OpHubSendNotificationModule {}
