import { Module } from '@nestjs/common';
import { OpHubPatientProfileService } from './op-hub-patient-profile.service';
import { OpHubPatientProfileController } from './op-hub-patient-profile.controller';
import { FaceAuthService } from 'src/face-auth/face-auth.service';

@Module({
  controllers: [OpHubPatientProfileController],
  providers: [OpHubPatientProfileService,FaceAuthService],
})
export class OpHubPatientProfileModule {}
