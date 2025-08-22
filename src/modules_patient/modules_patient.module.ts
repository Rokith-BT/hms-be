import { Module } from '@nestjs/common';
import { ModulesPatientService } from './modules_patient.service';
import { ModulesPatientController } from './modules_patient.controller';

@Module({
  controllers: [ModulesPatientController],
  providers: [ModulesPatientService],
})
export class ModulesPatientModule {}
