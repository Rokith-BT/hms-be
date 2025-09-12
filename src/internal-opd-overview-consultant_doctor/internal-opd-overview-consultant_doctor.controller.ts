/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { InternalOpdOverviewConsultantDoctorService } from './internal-opd-overview-consultant_doctor.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('internal-opd-overview-consultant-doctor')
export class InternalOpdOverviewConsultantDoctorController {
  constructor(private readonly internalOpdOverviewConsultantDoctorService: InternalOpdOverviewConsultantDoctorService) { }


  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query('patient_id') patient_id: number) {
    return this.internalOpdOverviewConsultantDoctorService.findAll(patient_id);
  }






}
