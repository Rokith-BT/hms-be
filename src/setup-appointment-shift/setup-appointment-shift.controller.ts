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
import { SetupAppointmentShiftService } from './setup-appointment-shift.service';
import { SetupAppointmentShift } from './entities/setup-appointment-shift.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup-appointment-shift')
export class SetupAppointmentShiftController {
  constructor(
    private readonly setupAppointmentShiftService: SetupAppointmentShiftService,
  ) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() appointment_shiftEntity: SetupAppointmentShift) {
    return this.setupAppointmentShiftService.create(appointment_shiftEntity);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupAppointmentShiftService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupAppointmentShiftService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() appointment_shiftEntity: SetupAppointmentShift,
  ) {
    return this.setupAppointmentShiftService.update(
      id,
      appointment_shiftEntity,
    );
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Query('Hospital_id') Hospital_id: number,
  ) {
    return this.setupAppointmentShiftService.remove(
      id,
      Hospital_id,
    );
  }
  @UseGuards(AuthGuard)
  @Get('/keyword/appointmentShift/:search')
  AppointmentShift(@Param('search') search: string) {
    return this.setupAppointmentShiftService.AppointmentShift(search);
  }
  @UseGuards(AuthGuard)
  @Get('/v2/getAllshift')
  async findAllDesig(@Query('limit') limit: number,
    @Query('page') page: number,
    @Query('search') search?: string) {

    try {
      let final_output = await this.setupAppointmentShiftService.findallshift(

        limit || 10,
        page || 1,
        search || ''
      );
      console.log("final_output", final_output);


      if (final_output.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_output.details,
          total: final_output.total,
        }
      }
      return this.setupAppointmentShiftService.findallshift(limit, page, search);
      console.log("aaa");


    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE
      }
    }

  }
}
