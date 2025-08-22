import { Test, TestingModule } from '@nestjs/testing';
import { PhpIncomeReportController } from './php-income-report.controller';
import { PhpIncomeReportService } from './php-income-report.service';

describe('PhpIncomeReportController', () => {
  let controller: PhpIncomeReportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhpIncomeReportController],
      providers: [PhpIncomeReportService],
    }).compile();

    controller = module.get<PhpIncomeReportController>(PhpIncomeReportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
