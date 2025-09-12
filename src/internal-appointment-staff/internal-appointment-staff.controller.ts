import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { InternalAppointmentStaffService } from './internal-appointment-staff.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('internal-appointment-staff')
export class InternalAppointmentStaffController {
  constructor(private readonly internalAppointmentStaffService: InternalAppointmentStaffService) { }



  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query('date') date: any) {

    return this.internalAppointmentStaffService.findAll(date);
  }


}
