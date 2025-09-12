import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EmrOpdPatientAndDoctorProfileService } from './emr_opd_patient_and_doctor_profile.service';

@Controller('emr-opd-patient-and-doctor-profile')
export class EmrOpdPatientAndDoctorProfileController {
  constructor(private readonly emrOpdPatientAndDoctorProfileService: EmrOpdPatientAndDoctorProfileService) {}

 

 

  @Get('patient')
  findpatient(@Query('patient_id') patient_id:number) {
    return this.emrOpdPatientAndDoctorProfileService.findone(patient_id);
  }


  @Get('staff_id')
  finddoctor(@Query('staff_id') staff_id:number) {
    return this.emrOpdPatientAndDoctorProfileService.finddoctors(+staff_id);
  }


}
