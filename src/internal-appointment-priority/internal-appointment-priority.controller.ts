import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { InternalAppointmentPriorityService } from './internal-appointment-priority.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('internal-appointment-priority')
export class InternalAppointmentPriorityController {
  constructor(private readonly internalAppointmentPriorityService: InternalAppointmentPriorityService) { }


  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.internalAppointmentPriorityService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.internalAppointmentPriorityService.findOne(id);
  }



}
