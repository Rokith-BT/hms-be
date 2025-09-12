import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { OpdPrescriptionService } from './opd_prescription.service';
import { OpdPrescription } from './entities/opd_prescription.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('opd-prescription')
export class OpdPrescriptionController {
  constructor(private readonly opdPrescriptionService: OpdPrescriptionService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createPrescriptionOpd: OpdPrescription) {
    return this.opdPrescriptionService.create(createPrescriptionOpd);
  }




}
