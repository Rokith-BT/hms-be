import { Module } from '@nestjs/common';
import { InternalIpdPaymentService } from './internal-ipd-payment.service';
import { InternalIpdPaymentController } from './internal-ipd-payment.controller';

@Module({
  controllers: [InternalIpdPaymentController],
  providers: [InternalIpdPaymentService],
})
export class InternalIpdPaymentModule {}
