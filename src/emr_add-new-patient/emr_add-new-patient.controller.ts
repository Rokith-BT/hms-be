import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmrAddNewPatientService } from './emr_add-new-patient.service';
import { Entity } from 'typeorm';
import { EmrAddNewPatient } from './entities/emr_add-new-patient.entity';

@Controller('emr-add-new-patient')
export class EmrAddNewPatientController {
  constructor(private readonly emrAddNewPatientService: EmrAddNewPatientService) {}

  @Post('/patient')
  create(@Body() Entity: EmrAddNewPatient) {
    return this.emrAddNewPatientService.create(Entity);
  }

  @Get()
  findAll() {
    return this.emrAddNewPatientService.findall();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.emrAddNewPatientService.findone(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() Entity: EmrAddNewPatient) {
    return this.emrAddNewPatientService.update(+id,Entity );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.emrAddNewPatientService.remove(id);
  }
}
