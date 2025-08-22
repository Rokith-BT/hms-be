import { Module } from '@nestjs/common';
import { SettingsModulesPatientService } from './settings-modules_patient.service';
import { SettingsModulesPatientController } from './settings-modules_patient.controller';

@Module({
  controllers: [SettingsModulesPatientController],
  providers: [SettingsModulesPatientService],
})
export class SettingsModulesPatientModule {}
