import { Test, TestingModule } from '@nestjs/testing';
import { OverallPaymentSummaryController } from './overall-payment-summary.controller';
import { OverallPaymentSummaryService } from './overall-payment-summary.service';

describe('OverallPaymentSummaryController', () => {
  let controller: OverallPaymentSummaryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OverallPaymentSummaryController],
      providers: [OverallPaymentSummaryService],
    }).compile();

    controller = module.get<OverallPaymentSummaryController>(OverallPaymentSummaryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
