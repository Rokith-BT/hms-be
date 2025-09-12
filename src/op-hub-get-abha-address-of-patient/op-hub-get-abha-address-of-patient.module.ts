import { Module } from '@nestjs/common';
import { OpHubGetAbhaAddressOfPatientService } from './op-hub-get-abha-address-of-patient.service';
import { OpHubGetAbhaAddressOfPatientController } from './op-hub-get-abha-address-of-patient.controller';

@Module({
  controllers: [OpHubGetAbhaAddressOfPatientController],
  providers: [OpHubGetAbhaAddressOfPatientService],
})
export class OpHubGetAbhaAddressOfPatientModule {}
