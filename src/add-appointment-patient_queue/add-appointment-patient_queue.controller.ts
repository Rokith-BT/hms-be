import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AddAppointmentPatientQueueService } from './add-appointment-patient_queue.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('add-appointment-patient-queue')
export class AddAppointmentPatientQueueController {
  constructor(
    private readonly addAppointmentPatientQueueService: AddAppointmentPatientQueueService,
  ) { }
  @UseGuards(AuthGuard)
  @Get()
  findAll(
    @Query('doctor') doctor: number,
    @Query('date') date: string,
    @Query('global_shift_id') global_shift_id: number,
    @Query('doctor_shift_id') doctor_shift_id: number,
  ) {

    return this.addAppointmentPatientQueueService.findall(
      doctor,
      date,
      global_shift_id,
      doctor_shift_id,
    );
  }


  @UseGuards(AuthGuard)

  @Get('/v2/getAllpage')
  async findAllDesig(@Query('doctor') doctor: number, @Query('date') date: string, @Query('global_shift_id') global_shift_id: number, @Query('doctor_shift') doctor_shift: number, @Query('limit') limit: number, @Query('page') page: number) {
    try {
      let final_output = await this.addAppointmentPatientQueueService.findallpatientqueue(
        doctor,
        date,
        global_shift_id,
        doctor_shift,
        limit || 10,
        page || 1
      )

      if (final_output.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_output.details,
          total: final_output.total
        }
      }
    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE
      }
    }
    return this.addAppointmentPatientQueueService.findallpatientqueue(doctor,
      date,
      global_shift_id,
      doctor_shift, limit, page);
  }
}
