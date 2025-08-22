import { Test, TestingModule } from '@nestjs/testing';
import { PhpPayrollReportController } from './php-payroll-report.controller';
import { PhpPayrollReportService } from './php-payroll-report.service';

describe('PhpPayrollReportController', () => {
  let controller: PhpPayrollReportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhpPayrollReportController],
      providers: [PhpPayrollReportService],
    }).compile();

    controller = module.get<PhpPayrollReportController>(PhpPayrollReportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
