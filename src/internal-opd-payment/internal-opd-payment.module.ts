import { Module } from '@nestjs/common';
import { InternalOpdPaymentService } from './internal-opd-payment.service';
import { InternalOpdPaymentController } from './internal-opd-payment.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  controllers: [InternalOpdPaymentController],
  providers: [InternalOpdPaymentService, DynamicDatabaseService],
})
export class InternalOpdPaymentModule { }
