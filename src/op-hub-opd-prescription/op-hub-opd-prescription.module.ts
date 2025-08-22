import { Module } from '@nestjs/common';
import { OpHubOpdPrescriptionService } from './op-hub-opd-prescription.service';
import { OpHubOpdPrescriptionController } from './op-hub-opd-prescription.controller';

@Module({
  controllers: [OpHubOpdPrescriptionController],
  providers: [OpHubOpdPrescriptionService],
})
export class OpHubOpdPrescriptionModule {}
