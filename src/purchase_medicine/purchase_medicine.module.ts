import { Module } from '@nestjs/common';
import { PurchaseMedicineService } from './purchase_medicine.service';
import { PurchaseMedicineController } from './purchase_medicine.controller';

@Module({
  controllers: [PurchaseMedicineController],
  providers: [PurchaseMedicineService],
})
export class PurchaseMedicineModule {}
