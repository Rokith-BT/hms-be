import { Controller, Get, Query } from '@nestjs/common';
import { PhrAppointmentStatusService } from './phr-appointment-status.service';

@Controller('phr-appointment-status')
export class PhrAppointmentStatusController {
  constructor(private readonly phrAppointmentStatusService: PhrAppointmentStatusService) { }
  @Get()
  findAll(@Query('appointment_id') appointment_id: number) {
    return this.phrAppointmentStatusService.findAll(appointment_id);
  }

  @Get('/tracking')
  getStatusTracking(@Query('appointment_id') appointment_id: string) {
    return this.phrAppointmentStatusService.appointment_status_tracking(appointment_id);
  }

  @Get('/statusList')
  listForTracking(@Query('hospital_id') hospital_id: number) {
    return this.phrAppointmentStatusService.findAllForTracking(hospital_id);
  }
}
