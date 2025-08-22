import { Module } from '@nestjs/common';
import { RevertDischargePatientOpdModuleService } from './revert_discharge_patient_opd_module.service';
import { RevertDischargePatientOpdModuleController } from './revert_discharge_patient_opd_module.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  controllers: [RevertDischargePatientOpdModuleController],
  providers: [RevertDischargePatientOpdModuleService,DynamicDatabaseService],
})
export class RevertDischargePatientOpdModuleModule {}
