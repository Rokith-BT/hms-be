import { Test, TestingModule } from '@nestjs/testing';
import { PhpIpdReportService } from './php-ipd-report.service';

describe('PhpIpdReportService', () => {
  let service: PhpIpdReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhpIpdReportService],
    }).compile();

    service = module.get<PhpIpdReportService>(PhpIpdReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
