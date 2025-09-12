import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RevertDischargePatientOpdModuleService } from './revert_discharge_patient_opd_module.service';
import { RevertDischargePatientOpdModule } from './entities/revert_discharge_patient_opd_module.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('revert-discharge-patient-opd-module')
export class RevertDischargePatientOpdModuleController {
  constructor(private readonly revertDischargePatientOpdModuleService: RevertDischargePatientOpdModuleService) { }


  @UseGuards(AuthGuard)
  @Patch('/:id')
  update(@Param('id') id: number, @Body() RevertDischargePatientOpd: RevertDischargePatientOpdModule) {
    return this.revertDischargePatientOpdModuleService.update(id, RevertDischargePatientOpd);
  }


}
