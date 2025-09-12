import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CheckForDuplicateAppointmentService } from './check-for-duplicate-appointment.service';
import { CheckForDuplicateAppointment } from './entities/check-for-duplicate-appointment.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('check-for-duplicate-appointment')
export class CheckForDuplicateAppointmentController {
  constructor(private readonly checkForDuplicateAppointmentService: CheckForDuplicateAppointmentService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createCheckForDuplicateAppointmentDto: CheckForDuplicateAppointment) {
    return this.checkForDuplicateAppointmentService.create(createCheckForDuplicateAppointmentDto);
  }

}
