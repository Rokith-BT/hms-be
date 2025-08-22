import { Module } from '@nestjs/common';
import { BillingFilterService } from './billing_filter.service';
import { BillingFilterController } from './billing_filter.controller';

@Module({
  controllers: [BillingFilterController],
  providers: [BillingFilterService],
})
export class BillingFilterModule {}
