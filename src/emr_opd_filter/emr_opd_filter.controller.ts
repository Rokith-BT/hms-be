import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EmrOpdFilterService } from './emr_opd_filter.service';

@Controller('emr-opd-filter')
export class EmrOpdFilterController {
  constructor(private readonly emrOpdFilterService: EmrOpdFilterService) {}

 

  @Get('/filter')
  findAll(@Query('fromDate') fromDate: string,
  @Query('toDate') toDate: string,
  @Query('doctorId') doctorId: number,
//   @Query('payment_status') paymentStatus: string,
// @Query('appointmentsource')appointmentsource:string,
//   @Query('hospital_id') hospital_id: number,
//   @Query('mobile_no')mobile_no:string,
//   @Query('patient_id')patient_id:number,
  @Query('gender')gender:string,
@Query(`status`)status:string
) {
    return this.emrOpdFilterService.findAll(fromDate,toDate,doctorId,gender,status);
  }

}
