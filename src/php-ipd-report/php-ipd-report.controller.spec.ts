import { Test, TestingModule } from '@nestjs/testing';
import { PhpIpdReportController } from './php-ipd-report.controller';
import { PhpIpdReportService } from './php-ipd-report.service';

describe('PhpIpdReportController', () => {
  let controller: PhpIpdReportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhpIpdReportController],
      providers: [PhpIpdReportService],
    }).compile();

    controller = module.get<PhpIpdReportController>(PhpIpdReportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
