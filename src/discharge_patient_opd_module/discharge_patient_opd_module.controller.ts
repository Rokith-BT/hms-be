/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { DischargePatientOpdModuleService } from './discharge_patient_opd_module.service';
import { DischargePatientOpdModule } from './entities/discharge_patient_opd_module.entity'
import { AuthGuard } from 'src/auth/auth.guard';
@Controller('discharge-patient-opd-module')
export class DischargePatientOpdModuleController {
  constructor(private readonly dischargePatientOpdModuleService: DischargePatientOpdModuleService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() DischargePatientOpdModule: DischargePatientOpdModule) {
    return this.dischargePatientOpdModuleService.create(DischargePatientOpdModule);
  }
  @UseGuards(AuthGuard)
   @Get()
  async findAll(
    @Query('limit') limit: string,
    @Query('page') page: string
  ) {
    const limitNum = parseInt(limit) || 10;
    const pageNum = parseInt(page) || 1;

    return await this.dischargePatientOpdModuleService.findAll(limitNum, pageNum);
  }

  @UseGuards(AuthGuard)
  @Patch('/:id')
  update(@Param('id') id: number, @Body() DischargePatientOpdModule: DischargePatientOpdModule) {
    return this.dischargePatientOpdModuleService.update(id, DischargePatientOpdModule);
  }

}