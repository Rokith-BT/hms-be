import { Test, TestingModule } from '@nestjs/testing';
import { PhpExpenseReportService } from './php-expense-report.service';

describe('PhpExpenseReportService', () => {
  let service: PhpExpenseReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhpExpenseReportService],
    }).compile();

    service = module.get<PhpExpenseReportService>(PhpExpenseReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
