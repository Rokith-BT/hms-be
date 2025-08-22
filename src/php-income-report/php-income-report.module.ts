import { Module } from '@nestjs/common';
import { PhpIncomeReportService } from './php-income-report.service';
import { PhpIncomeReportController } from './php-income-report.controller';

@Module({
  controllers: [PhpIncomeReportController],
  providers: [PhpIncomeReportService],
})
export class PhpIncomeReportModule {}
