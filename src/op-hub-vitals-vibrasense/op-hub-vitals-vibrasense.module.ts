import { Module } from '@nestjs/common';
import { OpHubVitalsVibrasenseService } from './op-hub-vitals-vibrasense.service';
import { OpHubVitalsVibrasenseController } from './op-hub-vitals-vibrasense.controller';

@Module({
  controllers: [OpHubVitalsVibrasenseController],
  providers: [OpHubVitalsVibrasenseService],
})
export class OpHubVitalsVibrasenseModule {}
