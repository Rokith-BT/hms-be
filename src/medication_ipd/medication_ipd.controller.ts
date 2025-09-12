import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MedicationIpdService } from './medication_ipd.service';
import { MedicationIpd } from './entities/medication_ipd.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('medication-ipd')
export class MedicationIpdController {
  constructor(private readonly medicationIpdService: MedicationIpdService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createMedicationIpd: MedicationIpd) {
    return this.medicationIpdService.create(createMedicationIpd);
  }
  @UseGuards(AuthGuard)
  @Get('/:id')
  findMedication(@Param('id') id: number) {
    return this.medicationIpdService.findMedication(id);
  }
  @UseGuards(AuthGuard)
  @Patch('/:id')
  update(@Param('id') id: number, @Body() createMedicationIpd: MedicationIpd) {
    return this.medicationIpdService.update(id, createMedicationIpd);
  }
  @UseGuards(AuthGuard)
  @Delete('/:id')
  async removeMedication(
    @Param('id') id: number,
    @Query('Hospital_id') Hospital_id: number,
  ): Promise<{ status: string; message: string }> {
    await this.medicationIpdService.removeMedication(id, Hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };
  }
}
