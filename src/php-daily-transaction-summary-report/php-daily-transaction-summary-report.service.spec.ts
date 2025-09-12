import { Test, TestingModule } from '@nestjs/testing';
import { PhpDailyTransactionSummaryReportService } from './php-daily-transaction-summary-report.service';

describe('PhpDailyTransactionSummaryReportService', () => {
  let service: PhpDailyTransactionSummaryReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhpDailyTransactionSummaryReportService],
    }).compile();

    service = module.get<PhpDailyTransactionSummaryReportService>(PhpDailyTransactionSummaryReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
