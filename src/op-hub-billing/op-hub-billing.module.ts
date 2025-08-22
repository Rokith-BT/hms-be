import { Module } from '@nestjs/common';
import { OpHubBillingService } from './op-hub-billing.service';
import { OpHubBillingController } from './op-hub-billing.controller';

@Module({
  controllers: [OpHubBillingController],
  providers: [OpHubBillingService],
})
export class OpHubBillingModule {}
