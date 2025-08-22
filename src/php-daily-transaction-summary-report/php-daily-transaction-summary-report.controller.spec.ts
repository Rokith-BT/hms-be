import { Test, TestingModule } from '@nestjs/testing';
import { PhpDailyTransactionSummaryReportController } from './php-daily-transaction-summary-report.controller';
import { PhpDailyTransactionSummaryReportService } from './php-daily-transaction-summary-report.service';

describe('PhpDailyTransactionSummaryReportController', () => {
  let controller: PhpDailyTransactionSummaryReportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhpDailyTransactionSummaryReportController],
      providers: [PhpDailyTransactionSummaryReportService],
    }).compile();

    controller = module.get<PhpDailyTransactionSummaryReportController>(PhpDailyTransactionSummaryReportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
