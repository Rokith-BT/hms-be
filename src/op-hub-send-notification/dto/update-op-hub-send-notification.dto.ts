import { PartialType } from '@nestjs/swagger';
import { CreateOpHubSendNotificationDto } from './create-op-hub-send-notification.dto';

export class UpdateOpHubSendNotificationDto extends PartialType(CreateOpHubSendNotificationDto) {}
