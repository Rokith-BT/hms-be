import { Module } from '@nestjs/common';
import { OpHubManualVitalsService } from './op-hub-manual-vitals.service';
import { OpHubManualVitalsController } from './op-hub-manual-vitals.controller';

@Module({
  controllers: [OpHubManualVitalsController],
  providers: [OpHubManualVitalsService],
})
export class OpHubManualVitalsModule {}
