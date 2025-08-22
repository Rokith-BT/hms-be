import { Module } from '@nestjs/common';
import { DischargePatientIpdModuleService } from './discharge_patient_ipd_module.service';
import { DischargePatientIpdModuleController } from './discharge_patient_ipd_module.controller';

@Module({
  controllers: [DischargePatientIpdModuleController],
  providers: [DischargePatientIpdModuleService],
})
export class DischargePatientIpdModuleModule {}
