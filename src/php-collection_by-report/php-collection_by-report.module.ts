import { Module } from '@nestjs/common';
import { PhpCollectionByReportService } from './php-collection_by-report.service';
import { PhpCollectionByReportController } from './php-collection_by-report.controller';

@Module({
  controllers: [PhpCollectionByReportController],
  providers: [PhpCollectionByReportService],
})
export class PhpCollectionByReportModule {}
