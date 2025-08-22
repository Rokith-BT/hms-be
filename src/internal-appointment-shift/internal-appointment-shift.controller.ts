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
import { InternalAppointmentShiftService } from './internal-appointment-shift.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('internal-appointment-shift')
export class InternalAppointmentShiftController {
  constructor(
    private readonly internalAppointmentShiftService: InternalAppointmentShiftService,
  ) {}

  @UseGuards(AuthGuard)
  @Get(':id')
  findAll(@Param('id') id) {
    return this.internalAppointmentShiftService.findAll(id);
  }

  @UseGuards(AuthGuard)
  @Get('/shift/:id')
  find(@Param('id') id) {
    return this.internalAppointmentShiftService.findshift(id);
  }
}
