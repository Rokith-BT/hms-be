import { Module } from '@nestjs/common';
import { OpHubFcmTokenService } from './op-hub-fcm-token.service';
import { OpHubFcmTokenController } from './op-hub-fcm-token.controller';

@Module({
  controllers: [OpHubFcmTokenController],
  providers: [OpHubFcmTokenService],
})
export class OpHubFcmTokenModule {}
