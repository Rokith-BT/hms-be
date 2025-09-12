import { Test, TestingModule } from '@nestjs/testing';
import { PhpIncomeReportService } from './php-income-report.service';

describe('PhpIncomeReportService', () => {
  let service: PhpIncomeReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhpIncomeReportService],
    }).compile();

    service = module.get<PhpIncomeReportService>(PhpIncomeReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
