import { Module } from '@nestjs/common';
import { InternalTransactionIdService } from './internal-transaction-id.service';
import { InternalTransactionIdController } from './internal-transaction-id.controller';

@Module({
  controllers: [InternalTransactionIdController],
  providers: [InternalTransactionIdService],
})
export class InternalTransactionIdModule {}
