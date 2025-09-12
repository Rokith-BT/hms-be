import { Test, TestingModule } from '@nestjs/testing';
import { PhpOpdReportService } from './php-opd-report.service';

describe('PhpOpdReportService', () => {
  let service: PhpOpdReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhpOpdReportService],
    }).compile();

    service = module.get<PhpOpdReportService>(PhpOpdReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
