import { Test, TestingModule } from '@nestjs/testing';
import { PhpTransactionReportController } from './php-transaction-report.controller';
import { PhpTransactionReportService } from './php-transaction-report.service';

describe('PhpTransactionReportController', () => {
  let controller: PhpTransactionReportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhpTransactionReportController],
      providers: [PhpTransactionReportService],
    }).compile();

    controller = module.get<PhpTransactionReportController>(PhpTransactionReportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
