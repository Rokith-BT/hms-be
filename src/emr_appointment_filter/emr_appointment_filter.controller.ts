import { Controller, Get, Post, Body, Patch, Delete, Query } from '@nestjs/common';
import { EmrAppointmentFilterService } from './emr_appointment_filter.service';

@Controller('emr-appointment-filter')
export class EmrAppointmentFilterController {
  constructor(private readonly emrAppointmentFilterService: EmrAppointmentFilterService) {}

 

  @Get('/slot')
  findAll(@Query('staff_id')staff_id:number,@Query ('global_shift_id') global_shift_id:any,@Query('date') date:any) {
    console.log("controller");
    
    return this.emrAppointmentFilterService.find_slot_filter(global_shift_id,date,staff_id);
  }

@Get('/shift')
findall(@Query ('staff_id') staff_id: any, @Query ('date') date:any) {
  return this.emrAppointmentFilterService.find_shift_filter(staff_id,date)
}
  
}
