import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { OpdMedicationService } from './opd-medication.service';
import { OpdMedication } from './entities/opd-medication.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('opd-medication')
export class MedicationOpdController {
  constructor(private readonly medicationOpdService: OpdMedicationService) { }

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createMedicationOpd: OpdMedication) {
    return this.medicationOpdService.create(createMedicationOpd);
  }
  @UseGuards(AuthGuard)
  @Get()
  findall() {
    return this.medicationOpdService.findall();
  }
  @UseGuards(AuthGuard)
  @Get('/:id')
  findMedication(@Param('id') id: number) {
    return this.medicationOpdService.findMedication(id);
  }

  @UseGuards(AuthGuard)
  @Patch('/:id')
  update(@Param('id') id: number, @Body() createMedicationOpd: OpdMedication) {
    return this.medicationOpdService.update(id, createMedicationOpd);
  }

  @UseGuards(AuthGuard)
  @Delete('/:id')
  async removeMedication(@Param('id') id: number, @Query('Hospital_id') Hospital_id: number): Promise<{ status: string; message: string }> {

    const deleteMedication = await this.medicationOpdService.removeMedication(id, Hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };


  }
}
