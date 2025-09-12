import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EmrPatientDetailsService } from './emr_patient_details.service';
@Controller('emr-patient-details')
export class EmrPatientDetailsController {
  constructor(private readonly emrPatientDetailsService: EmrPatientDetailsService) {}

  @Get()
  findpatient(@Query('patients_id') patients_id:number, @Query('mobile_no') mobile_no:number) {
    return this.emrPatientDetailsService.findall(patients_id,mobile_no)
  }

  @Get('/doctor')
  finddoctor(@Query(`staff_id`) staff_id:number) {
    return this.emrPatientDetailsService.finddoctor(staff_id)
  }


  @Get('/doctor_shift')
  finddoctor_shift(@Query('staff_id') staff_id: number) {
    console.log("eeee",staff_id);

    return this.emrPatientDetailsService.findDoctor_shift(staff_id)
    
  }


    @Get('/doctor_slot')
  finddoctor_slot(@Query('staff_id') staff_id:number, @Query('global_shift') global_shift:number) {
   console.log("aaa",staff_id,global_shift);
   
    return this.emrPatientDetailsService.findDoctor_slot(staff_id,global_shift)
    
  }


}
