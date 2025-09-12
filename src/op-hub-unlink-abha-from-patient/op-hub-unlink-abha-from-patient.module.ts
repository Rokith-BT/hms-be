import { Module } from '@nestjs/common';
import { OpHubUnlinkAbhaFromPatientService } from './op-hub-unlink-abha-from-patient.service';
import { OpHubUnlinkAbhaFromPatientController } from './op-hub-unlink-abha-from-patient.controller';

@Module({
  controllers: [OpHubUnlinkAbhaFromPatientController],
  providers: [OpHubUnlinkAbhaFromPatientService],
})
export class OpHubUnlinkAbhaFromPatientModule {}
