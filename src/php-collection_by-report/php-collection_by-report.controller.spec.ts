import { Test, TestingModule } from '@nestjs/testing';
import { PhpCollectionByReportController } from './php-collection_by-report.controller';
import { PhpCollectionByReportService } from './php-collection_by-report.service';

describe('PhpCollectionByReportController', () => {
  let controller: PhpCollectionByReportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhpCollectionByReportController],
      providers: [PhpCollectionByReportService],
    }).compile();

    controller = module.get<PhpCollectionByReportController>(PhpCollectionByReportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
