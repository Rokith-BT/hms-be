import { Module } from '@nestjs/common';
import { SetupPatientNewPatientService } from './setup-patient-new_patient.service';
import { SetupPatientNewPatientController } from './setup-patient-new_patient.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetupPatientNewPatient } from './entities/setup-patient-new_patient.entity';
import { FaceAuthService } from 'src/face-auth/face-auth.service';

@Module({
  imports:[ TypeOrmModule.forFeature([SetupPatientNewPatient])],

  controllers: [SetupPatientNewPatientController],
  providers: [SetupPatientNewPatientService,DynamicDatabaseService,FaceAuthService],
})
export class SetupPatientNewPatientModule {}
