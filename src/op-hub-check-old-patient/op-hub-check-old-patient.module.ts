import { Module } from '@nestjs/common';
import { OpHubCheckOldPatientService } from './op-hub-check-old-patient.service';
import { OpHubCheckOldPatientController } from './op-hub-check-old-patient.controller';

@Module({
  controllers: [OpHubCheckOldPatientController],
  providers: [OpHubCheckOldPatientService],
})
export class OpHubCheckOldPatientModule {}
