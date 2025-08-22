import { Module } from '@nestjs/common';
import { OverallPaymentSummaryService } from './overall-payment-summary.service';
import { OverallPaymentSummaryController } from './overall-payment-summary.controller';

@Module({
  controllers: [OverallPaymentSummaryController],
  providers: [OverallPaymentSummaryService],
})
export class OverallPaymentSummaryModule {}
