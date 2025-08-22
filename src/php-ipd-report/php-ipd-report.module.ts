import { Module } from '@nestjs/common';
import { PhpIpdReportService } from './php-ipd-report.service';
import { PhpIpdReportController } from './php-ipd-report.controller';

@Module({
  controllers: [PhpIpdReportController],
  providers: [PhpIpdReportService],
})
export class PhpIpdReportModule {}
