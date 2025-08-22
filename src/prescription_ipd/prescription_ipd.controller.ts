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
import { PrescriptionIpdService } from './prescription_ipd.service';
import { PrescriptionIpd } from './entities/prescription_ipd.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('prescription-ipd')
export class PrescriptionIpdController {
  constructor(
    private readonly prescriptionIpdService: PrescriptionIpdService,
  ) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createPrescriptionIpd: PrescriptionIpd) {
    return this.prescriptionIpdService.create(createPrescriptionIpd);
  }
  @UseGuards(AuthGuard)
  @Get('/findingName/:id')
  findFindingsName(@Param('id') id: number) {
    return this.prescriptionIpdService.findFindingsName(id);
  }
  @UseGuards(AuthGuard)
  @Get('/findingNameandDesc/:id')
  findFindingsNameandDesc(@Param('id') id: number) {
    return this.prescriptionIpdService.findFindingsNameandDesc(id);
  }
  @UseGuards(AuthGuard)
  @Get('/prescriptionByIpdno/:id')
  findprescriptionByIpdno(
    @Param('id') id: number,
    @Query('search') search: string,
  ) {
    return this.prescriptionIpdService.findprescriptionByIpdno(id, search);
  }
  @UseGuards(AuthGuard)
  @Get('/viewPrescriptionBYIPDno/:id')
  findviewPrescription(@Param('id') id: number) {
    return this.prescriptionIpdService.findviewPrescription(id);
  }
  @UseGuards(AuthGuard)
  @Delete('/:id')
  async removePrescription(
    @Param('id') id: number,
    @Query('Hospital_id') Hospital_id: number,
  ): Promise<{ status: string; message: string }> {
    await this.prescriptionIpdService.removePrescription(id, Hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };
  }
  @UseGuards(AuthGuard)
  @Patch('/:id')
  update(
    @Param('id') id: number,
    @Body() createPrescriptionIpd: PrescriptionIpd,
  ) {
    return this.prescriptionIpdService.update(id, createPrescriptionIpd);
  }
  @UseGuards(AuthGuard)
  @Get('/findMedicine/:id')
  findMedicineName(@Param('id') id: number) {
    return this.prescriptionIpdService.findMedicineName(id);
  }
  @UseGuards(AuthGuard)
  @Get('/findDosage/:id')
  findDosageName(@Param('id') id: number) {
    return this.prescriptionIpdService.findDosageName(id);
  }
}
