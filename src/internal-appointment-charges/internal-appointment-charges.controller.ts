import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { InternalAppointmentChargesService } from './internal-appointment-charges.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('internal-appointment-charges')
export class InternalAppointmentChargesController {
  constructor(private readonly internalAppointmentChargesService: InternalAppointmentChargesService) { }


  @UseGuards(AuthGuard)
  @Get(':id')
  findAll(@Param('id') id) {
    return this.internalAppointmentChargesService.findAll(id);
  }



}
