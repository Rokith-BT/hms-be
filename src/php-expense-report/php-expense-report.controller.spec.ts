import { Test, TestingModule } from '@nestjs/testing';
import { PhpExpenseReportController } from './php-expense-report.controller';
import { PhpExpenseReportService } from './php-expense-report.service';

describe('PhpExpenseReportController', () => {
  let controller: PhpExpenseReportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhpExpenseReportController],
      providers: [PhpExpenseReportService],
    }).compile();

    controller = module.get<PhpExpenseReportController>(PhpExpenseReportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
