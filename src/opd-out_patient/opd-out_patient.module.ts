import { Module } from '@nestjs/common';
import { OpdOutPatientService } from './opd-out_patient.service';
import { OpdOutPatientController } from './opd-out_patient.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpdOutPatient } from './entities/opd-out_patient.entity';
import { FaceAuthService } from 'src/face-auth/face-auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([OpdOutPatient])],

  controllers: [OpdOutPatientController],
  providers: [OpdOutPatientService, FaceAuthService],
})
export class OpdOutPatientModule { }
