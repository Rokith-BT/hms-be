import { Module } from '@nestjs/common';
import { EmrAddNewPatientService } from './emr_add-new-patient.service';
import { EmrAddNewPatientController } from './emr_add-new-patient.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
import { FaceAuthService } from 'src/face-auth/face-auth.service';

@Module({
  controllers: [EmrAddNewPatientController],
  providers: [EmrAddNewPatientService,DynamicDatabaseService,FaceAuthService],
})
export class EmrAddNewPatientModule {}
