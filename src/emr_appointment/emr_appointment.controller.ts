import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { EmrAppointmentService } from './emr_appointment.service';
import { EmrAppointment } from './entities/emr_appointment.entity';

@Controller('emr-appointment')
export class EmrAppointmentController {
  constructor(private readonly emrAppointmentService: EmrAppointmentService) {}

  @Post()
  create(@Body() add_appointment:EmrAppointment) {
    return this.emrAppointmentService.create(add_appointment);
  }

  @Get('ALL')
  find() {
    return this.emrAppointmentService.find();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log("cccc");
    
    return this.emrAppointmentService.findOne(id);
  }

  @Get()
  findAll(@Query('fromDate') fromDate: string,
  @Query('toDate') toDate: string,
  @Query('doctorId') doctorId: number,
  @Query('appointStatus_id') appointStatus_id: number,
  @Query('appointStatus') appointStatus: string,
  @Query('payment_status') paymentStatus: string,
@Query('appointmentsource')appointmentsource:string,
  @Query('hospital_id') hospital_id: number,
  @Query('mobile_no')mobile_no:string,
  @Query('patient_id')patient_id:number,
  @Query('global_shift_id')global_shift_id:number,
  @Query('shift_id')shift_id:number,
  @Query('gender')gender:string,

  ) {
    return this.emrAppointmentService.findAll(fromDate,toDate,doctorId,appointStatus_id,appointStatus,hospital_id,paymentStatus,appointmentsource,mobile_no,patient_id,shift_id,global_shift_id,gender);
  }



  
 
  @Get('/counts/aaaaa')
findcount(@Query('date') date: any, @Query('status') status: number) {
  console.log("bbbb");
  
  return this.emrAppointmentService.findcount(date, status);
}

@Patch(':id')
  update(@Param('id') id: string, @Body() add_appointment:EmrAppointment) {
    return this.emrAppointmentService.update(+id, add_appointment);
  }


  @Get('/counts/percentage')
  findcountWithPercentage(@Query('date') date: any) {
    console.log("controller running");
    
    return this.emrAppointmentService.findcountWithPercentage(date);
  }
  

  @Get('/app_details/:id')
  find_appn_details(@Param('id') id :number) {
    console.log("controller appn running");

    return this.emrAppointmentService.find_Appointment_details(id)
    
  }

  
  @Put('/status')
  updates( @Body() add_appointment:EmrAppointment) {
    console.log("controller");
    
    return this.emrAppointmentService.status_update( add_appointment);
  }


























  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.emrAppointmentService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() EmrAppointment: EmrAppointment) {
  //   return this.emrAppointmentService.update(+id,EmrAppointment );
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.emrAppointmentService.remove(+id);
  // }
}
