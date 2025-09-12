import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AppointmentStatusService } from './appointment_status.service';
import { AppointmentStatus } from './entities/appointment_status.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('appointment-status')
export class AppointmentStatusController {
  constructor(
    private readonly appointmentStatusService: AppointmentStatusService,
  ) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() AppointmentStatusEntity: AppointmentStatus) {
    return this.appointmentStatusService.create(AppointmentStatusEntity);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.appointmentStatusService.findAll();
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() AppointmentStatusEntity: AppointmentStatus,
  ) {
    return this.appointmentStatusService.update(+id, AppointmentStatusEntity);
  }

  @UseGuards(AuthGuard)
  @Get('/v2/getAllpage')
  async findAllDesig() {
    return this.appointmentStatusService.findAllstatus();
  }
}
