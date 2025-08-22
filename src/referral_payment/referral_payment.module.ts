import { Module } from '@nestjs/common';
import { ReferralPaymentService } from './referral_payment.service';
import { ReferralPaymentController } from './referral_payment.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  controllers: [ReferralPaymentController],
  providers: [ReferralPaymentService,DynamicDatabaseService],
})
export class ReferralPaymentModule {}
