import { Module } from '@nestjs/common';
import { HumanResourcePayrollService } from './human_resource_payroll.service';
import { HumanResourcePayrollController } from './human_resource_payroll.controller';

@Module({
  controllers: [HumanResourcePayrollController],
  providers: [HumanResourcePayrollService],
})
export class HumanResourcePayrollModule {}
