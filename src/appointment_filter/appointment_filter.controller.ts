import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AppointmentFilterService } from './appointment_filter.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('appointment-filter')
export class AppointmentFilterController {
  constructor(
    private readonly appointmentFilterService: AppointmentFilterService,
  ) { }
  @UseGuards(AuthGuard)
  @Get()
  findall(
    @Query('date') date: string,
    @Query('fromDate') fromDate: string,
    @Query('todate') todate: string,
    @Query('doctorId') doctorId: number,
    @Query('appointment_status') appointment_status: string,
    @Query('live_consult') live_consult: string,
    @Query('gender') gender: string,
    @Query('global_shift_id') global_shift_id: number,
    @Query('doctor_shift') doctor_shift: number,
  ) {
    return this.appointmentFilterService.findall(
      date,
      fromDate,
      todate,
      doctorId,
      live_consult,
      appointment_status,
      gender,
      global_shift_id,
      doctor_shift,
    );
  }
}
