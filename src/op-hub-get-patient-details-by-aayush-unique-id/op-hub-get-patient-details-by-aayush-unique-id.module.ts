import { Module } from '@nestjs/common';
import { OpHubGetPatientDetailsByAayushUniqueIdService } from './op-hub-get-patient-details-by-aayush-unique-id.service';
import { OpHubGetPatientDetailsByAayushUniqueIdController } from './op-hub-get-patient-details-by-aayush-unique-id.controller';
import { FaceAuthService } from 'src/face-auth/face-auth.service';

@Module({
  controllers: [OpHubGetPatientDetailsByAayushUniqueIdController],
  providers: [OpHubGetPatientDetailsByAayushUniqueIdService,FaceAuthService],
})
export class OpHubGetPatientDetailsByAayushUniqueIdModule {}
