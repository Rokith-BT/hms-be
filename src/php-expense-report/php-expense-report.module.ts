import { Module } from '@nestjs/common';
import { PhpExpenseReportService } from './php-expense-report.service';
import { PhpExpenseReportController } from './php-expense-report.controller';

@Module({
  controllers: [PhpExpenseReportController],
  providers: [PhpExpenseReportService],
})
export class PhpExpenseReportModule {}
