import { Test, TestingModule } from '@nestjs/testing';
import { PhpOpdReportController } from './php-opd-report.controller';
import { PhpOpdReportService } from './php-opd-report.service';

describe('PhpOpdReportController', () => {
  let controller: PhpOpdReportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhpOpdReportController],
      providers: [PhpOpdReportService],
    }).compile();

    controller = module.get<PhpOpdReportController>(PhpOpdReportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
