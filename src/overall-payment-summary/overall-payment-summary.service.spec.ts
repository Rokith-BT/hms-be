import { Test, TestingModule } from '@nestjs/testing';
import { OverallPaymentSummaryService } from './overall-payment-summary.service';

describe('OverallPaymentSummaryService', () => {
  let service: OverallPaymentSummaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OverallPaymentSummaryService],
    }).compile();

    service = module.get<OverallPaymentSummaryService>(OverallPaymentSummaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
