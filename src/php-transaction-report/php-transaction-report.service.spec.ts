import { Test, TestingModule } from '@nestjs/testing';
import { PhpTransactionReportService } from './php-transaction-report.service';

describe('PhpTransactionReportService', () => {
  let service: PhpTransactionReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhpTransactionReportService],
    }).compile();

    service = module.get<PhpTransactionReportService>(PhpTransactionReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
