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
import { SetupAppointmentDoctorShiftService } from './setup-appointment-doctor_shift.service';
import { SetupAppointmentDoctorShift } from './entities/setup-appointment-doctor_shift.entity';
import { AuthGuard } from 'src/auth/auth.guard';
@Controller('setup-appointment-doctor-shift')
export class SetupAppointmentDoctorShiftController {
  constructor(
    private readonly setupAppointmentDoctorShiftService: SetupAppointmentDoctorShiftService,
  ) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() doctor_shiftEntity: SetupAppointmentDoctorShift) {
    return this.setupAppointmentDoctorShiftService.create(doctor_shiftEntity);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupAppointmentDoctorShiftService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get('/keyword/appointmentDoctorShift/:search')
  AppointmentDoctorShift(@Param('search') search: string) {
    return this.setupAppointmentDoctorShiftService.AppointmentDoctorShift(
      search,
    );
  }






  @UseGuards(AuthGuard)

  @Get('/v2/getAllpage')
  async findAllDesig(
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('search') search?: string
  ) {
    try {
      const final_output = await this.setupAppointmentDoctorShiftService.findalldoctorshift(
        limit || 10,
        page || 1,
        search || ''
      );

      if (final_output.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_output.details,
          total: final_output.total
        };
      }


      return this.setupAppointmentDoctorShiftService.findalldoctorshift(limit, page, search);

    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE
      };
    }
  }

}
