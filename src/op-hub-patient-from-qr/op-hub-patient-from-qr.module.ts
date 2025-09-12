import { Module } from '@nestjs/common';
import { OpHubPatientFromQrService } from './op-hub-patient-from-qr.service';
import { OpHubPatientFromQrController } from './op-hub-patient-from-qr.controller';
import { FaceAuthService } from 'src/face-auth/face-auth.service';

@Module({
  controllers: [OpHubPatientFromQrController],
  providers: [OpHubPatientFromQrService,FaceAuthService],
})
export class OpHubPatientFromQrModule {}
