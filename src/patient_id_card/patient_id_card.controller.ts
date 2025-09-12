import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { PatientIdCardService } from './patient_id_card.service';
import { PatientIdCard } from './entities/patient_id_card.entity'
import { AuthGuard } from 'src/auth/auth.guard';


@Controller('patient-id-card')
export class PatientIdCardController {
  constructor(private readonly patientIdCardService: PatientIdCardService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createPatientIdCard: PatientIdCard) {
    return this.patientIdCardService.create(createPatientIdCard);
  }

  @UseGuards(AuthGuard)
  @Patch('/:id')
  updatePatientIdCard(@Param('id') id: number, @Body() createPatientIdCard: PatientIdCard) {
    return this.patientIdCardService.updatePatientIdCard(id, createPatientIdCard);
  }


  @UseGuards(AuthGuard)
  @Delete('/:id')
  async removePatientIDcard(@Param('id') id: number, @Query('hospital_id') hospital_id: number): Promise<{ status: string; message: string }> {

    const deletePatientIDcard = await this.patientIdCardService.removePatientIDcard(id, hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };


  }



  // @Get()
  // findAll() {
  //   return this.patientIdCardService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.patientIdCardService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() createPatientIdCard: PatientIdCard) {
  //   return this.patientIdCardService.update(+id, createPatientIdCard);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.patientIdCardService.remove(+id);
  // }
}
