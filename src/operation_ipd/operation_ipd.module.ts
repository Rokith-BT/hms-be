import { Module } from '@nestjs/common';
import { OperationIpdService } from './operation_ipd.service';
import { OperationIpdController } from './operation_ipd.controller';

@Module({
  controllers: [OperationIpdController],
  providers: [OperationIpdService],
})
export class OperationIpdModule {}
