import { Test, TestingModule } from '@nestjs/testing';
import { PhpCollectionByReportService } from './php-collection_by-report.service';

describe('PhpCollectionByReportService', () => {
  let service: PhpCollectionByReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhpCollectionByReportService],
    }).compile();

    service = module.get<PhpCollectionByReportService>(PhpCollectionByReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
