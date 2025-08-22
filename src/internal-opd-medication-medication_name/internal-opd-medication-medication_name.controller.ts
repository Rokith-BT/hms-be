import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { InternalOpdMedicationMedicationNameService } from './internal-opd-medication-medication_name.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('internal-opd-medication-medication-name')
export class InternalOpdMedicationMedicationNameController {
  constructor(private readonly internalOpdMedicationMedicationNameService: InternalOpdMedicationMedicationNameService) { }

  @UseGuards(AuthGuard)
  @Get(':id')
  findall(@Param('id') id: number) {
    return this.internalOpdMedicationMedicationNameService.findall(id);
  }


}
