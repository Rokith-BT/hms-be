import { Module } from '@nestjs/common';
import { EmrOpdPatientAndDoctorProfileService } from './emr_opd_patient_and_doctor_profile.service';
import { EmrOpdPatientAndDoctorProfileController } from './emr_opd_patient_and_doctor_profile.controller';

@Module({
  controllers: [EmrOpdPatientAndDoctorProfileController],
  providers: [EmrOpdPatientAndDoctorProfileService],
})
export class EmrOpdPatientAndDoctorProfileModule {}
