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
import { RevertDischargePatientIpdModuleService } from './revert_discharge_patient_ipd_module.service';
import { RevertDischargePatientIpdModule } from './entities/revert_discharge_patient_ipd_module.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('revert-discharge-patient-ipd-module')
export class RevertDischargePatientIpdModuleController {
  constructor(
    private readonly revertDischargePatientIpdModuleService: RevertDischargePatientIpdModuleService,
  ) { }
  @UseGuards(AuthGuard)
  @Patch('/:id')
  update(
    @Param('id') id: number,
    @Body() RevertDischargePatientIpd: RevertDischargePatientIpdModule,
  ) {
    return this.revertDischargePatientIpdModuleService.update(
      id,
      RevertDischargePatientIpd,
    );
  }
}
