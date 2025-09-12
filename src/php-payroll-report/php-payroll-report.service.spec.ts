import { Test, TestingModule } from '@nestjs/testing';
import { PhpPayrollReportService } from './php-payroll-report.service';

describe('PhpPayrollReportService', () => {
  let service: PhpPayrollReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhpPayrollReportService],
    }).compile();

    service = module.get<PhpPayrollReportService>(PhpPayrollReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
