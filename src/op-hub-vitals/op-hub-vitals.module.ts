import { Module } from '@nestjs/common';
import { OpHubVitalsService } from './op-hub-vitals.service';
import { OpHubVitalsController } from './op-hub-vitals.controller';

@Module({
  controllers: [OpHubVitalsController],
  providers: [OpHubVitalsService],
})
export class OpHubVitalsModule {}
