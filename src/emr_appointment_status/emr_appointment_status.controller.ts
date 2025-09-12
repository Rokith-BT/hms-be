import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EmrAppointmentStatusService } from './emr_appointment_status.service';

@Controller('emr-appointment-status')
export class EmrAppointmentStatusController {
  constructor(private readonly emrAppointmentStatusService: EmrAppointmentStatusService) {}

  
  @Get()
  findAll(@Query('hospital_id')hospital_id:number) {
    console.log("1");
    
    return this.emrAppointmentStatusService.findAll(hospital_id);
  }

  @Get('/tracking')
  getStatusTracking(@Query('hospital_id')hospital_id:number,@Query('appointment_id')appointment_id:string) {
    console.log("2");

    return this.emrAppointmentStatusService.appointment_status_tracking(hospital_id,appointment_id);
  }

 

}