import { PartialType } from '@nestjs/swagger';
import { CreateOpHubFcmTokenDto } from './create-op-hub-fcm-token.dto';

export class UpdateOpHubFcmTokenDto extends PartialType(CreateOpHubFcmTokenDto) {}
