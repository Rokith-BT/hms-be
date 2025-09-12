import { Module } from '@nestjs/common';
import { OpHubPrescriptionService } from './op-hub-prescription.service';
import { OpHubPrescriptionController } from './op-hub-prescription.controller';

@Module({
  controllers: [OpHubPrescriptionController],
  providers: [OpHubPrescriptionService],
})
export class OpHubPrescriptionModule {}
