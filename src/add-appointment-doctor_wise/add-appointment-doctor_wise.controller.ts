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
import { AddAppointmentDoctorWiseService } from './add-appointment-doctor_wise.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('add-appointment-doctor-wise')
export class AddAppointmentDoctorWiseController {
  constructor(
    private readonly addAppointmentDoctorWiseService: AddAppointmentDoctorWiseService,
  ) { }
  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query('doctor') doctor: number, @Query('date') date: string) {
    return this.addAppointmentDoctorWiseService.findall(doctor, date);
  }

  @UseGuards(AuthGuard)
  @Get('/v2/getAllpage')
  async findAllDesig(
    @Query('doctor') doctor: number,
    @Query('date') date: string,
    @Query('limit') limit: number,
    @Query('page') page: number,
  ) {
    try {
      let final_output = await this.addAppointmentDoctorWiseService.findalldoctorwise(
        doctor,
        date,
        limit || 10,
        page || 1,
      );

      if (final_output.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_output.details,
          total: final_output.total,
          limit: final_output.limit,
          totalpages: Math.ceil(final_output.total / limit),
        };
      }
      else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: 'No appointments found',
          data: [],
          total: 0,
          limit: limit,
          page: page,
          totalPages: 0
        };
      }
    }
    catch (error) {

    }
    return this.addAppointmentDoctorWiseService.findalldoctorwise(
      doctor,
      date,
      limit,
      page);
  }
}
