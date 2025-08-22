import { Module } from '@nestjs/common';
import { EmrOpdOutPatientService } from './emr_opd_out_patient.service';
import { EmrOpdOutPatientController } from './emr_opd_out_patient.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmrOpdOutPatient } from './entities/emr_opd_out_patient.entity';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
import { FaceAuthService } from 'src/face-auth/face-auth.service';

@Module({
  imports:[ TypeOrmModule.forFeature([EmrOpdOutPatient])],

  controllers: [EmrOpdOutPatientController],
  providers: [EmrOpdOutPatientService,DynamicDatabaseService,FaceAuthService],
})
export class EmrOpdOutPatientModule {}
