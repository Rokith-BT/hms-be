import { Module } from '@nestjs/common';
import { PhpTransactionReportService } from './php-transaction-report.service';
import { PhpTransactionReportController } from './php-transaction-report.controller';

@Module({
  controllers: [PhpTransactionReportController],
  providers: [PhpTransactionReportService],
})
export class PhpTransactionReportModule {}
