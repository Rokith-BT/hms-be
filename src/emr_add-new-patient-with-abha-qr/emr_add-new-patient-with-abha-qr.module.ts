import { Module } from '@nestjs/common';
import { EmrAddNewPatientWithAbhaQrController } from './emr_add-new-patient-with-abha-qr.controller';
import { EmrAddNewPatientWithAbhaQr, Patient } from './entities/emr_add-new-patient-with-abha-qr.entity';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmrAddNewPatientWithAbhaQrservice } from './emr_add-new-patient-with-abha-qr.service';
import { FaceAuthService } from 'src/face-auth/face-auth.service';

@Module({
  imports:[ TypeOrmModule.forFeature([EmrAddNewPatientWithAbhaQr,Patient])],


  controllers: [EmrAddNewPatientWithAbhaQrController],
  providers: [EmrAddNewPatientWithAbhaQrservice,DynamicDatabaseService,FaceAuthService],
})
export class EmrAddNewPatientWithAbhaQrModule {}
