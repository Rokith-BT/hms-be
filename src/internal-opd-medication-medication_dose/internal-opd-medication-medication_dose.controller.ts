import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { InternalOpdMedicationMedicationDoseService } from './internal-opd-medication-medication_dose.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('internal-opd-medication-medication-dose')
export class InternalOpdMedicationMedicationDoseController {
  constructor(private readonly internalOpdMedicationMedicationDoseService: InternalOpdMedicationMedicationDoseService) { }

  @UseGuards(AuthGuard)
  @Get(':id')
  findall(@Param('id') id: number) {
    return this.internalOpdMedicationMedicationDoseService.findall(id);
  }




}
