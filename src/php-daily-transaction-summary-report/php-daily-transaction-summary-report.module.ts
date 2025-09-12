import { Module } from '@nestjs/common';
import { PhpDailyTransactionSummaryReportService } from './php-daily-transaction-summary-report.service';
import { PhpDailyTransactionSummaryReportController } from './php-daily-transaction-summary-report.controller';

@Module({
  controllers: [PhpDailyTransactionSummaryReportController],
  providers: [PhpDailyTransactionSummaryReportService],
})
export class PhpDailyTransactionSummaryReportModule {}
