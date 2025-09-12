import { Module } from '@nestjs/common';
import { PathologyGenerateBillService } from './pathology_generate_bill.service';
import { PathologyGenerateBillController } from './pathology_generate_bill.controller';

@Module({
  controllers: [PathologyGenerateBillController],
  providers: [PathologyGenerateBillService],
})
export class PathologyGenerateBillModule {}
