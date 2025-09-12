import { Module } from '@nestjs/common';
import { PharmacyGenerateBillService } from './pharmacy_generate_bill.service';
import { PharmacyGenerateBillController } from './pharmacy_generate_bill.controller';

@Module({
  controllers: [PharmacyGenerateBillController],
  providers: [PharmacyGenerateBillService],
})
export class PharmacyGenerateBillModule {}
