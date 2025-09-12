import { Module } from '@nestjs/common';
import { PhpPayrollReportService } from './php-payroll-report.service';
import { PhpPayrollReportController } from './php-payroll-report.controller';

@Module({
  controllers: [PhpPayrollReportController],
  providers: [PhpPayrollReportService],
})
export class PhpPayrollReportModule {}
