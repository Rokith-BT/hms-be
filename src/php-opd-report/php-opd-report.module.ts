import { Module } from '@nestjs/common';
import { PhpOpdReportService } from './php-opd-report.service';
import { PhpOpdReportController } from './php-opd-report.controller';

@Module({
  controllers: [PhpOpdReportController],
  providers: [PhpOpdReportService],
})
export class PhpOpdReportModule {}
