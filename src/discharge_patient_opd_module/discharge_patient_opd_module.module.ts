import { Module } from '@nestjs/common';
import { DischargePatientOpdModuleController } from './discharge_patient_opd_module.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DischargePatientOpdModule } from './entities/discharge_patient_opd_module.entity';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
import { DischargePatientOpdModuleService } from './discharge_patient_opd_module.service';
 
@Module({
 
  imports:[ TypeOrmModule.forFeature([DischargePatientOpdModule])],
 
 
  controllers: [DischargePatientOpdModuleController],
  providers: [DischargePatientOpdModuleService,DynamicDatabaseService],
})
export class DischargePatientOpdModuleModule {}