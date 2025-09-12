import { Module } from '@nestjs/common';
import { RadiologyGenerateBillService } from './radiology_generate_bill.service';
import { RadiologyGenerateBillController } from './radiology_generate_bill.controller';

@Module({
  controllers: [RadiologyGenerateBillController],
  providers: [RadiologyGenerateBillService],
})
export class RadiologyGenerateBillModule {}
