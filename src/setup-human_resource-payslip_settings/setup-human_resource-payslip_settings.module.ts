import { Module } from '@nestjs/common';
import { SetupHumanResourcePayslipSettingsService } from './setup-human_resource-payslip_settings.service';
import { SetupHumanResourcePayslipSettingsController } from './setup-human_resource-payslip_settings.controller';

@Module({
  controllers: [SetupHumanResourcePayslipSettingsController],
  providers: [SetupHumanResourcePayslipSettingsService],
})
export class SetupHumanResourcePayslipSettingsModule { }
