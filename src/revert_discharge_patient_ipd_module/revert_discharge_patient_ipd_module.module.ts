import { Module } from '@nestjs/common';
import { RevertDischargePatientIpdModuleService } from './revert_discharge_patient_ipd_module.service';
import { RevertDischargePatientIpdModuleController } from './revert_discharge_patient_ipd_module.controller';

@Module({
  controllers: [RevertDischargePatientIpdModuleController],
  providers: [RevertDischargePatientIpdModuleService],
})
export class RevertDischargePatientIpdModuleModule {}