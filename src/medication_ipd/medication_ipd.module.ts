import { Module } from '@nestjs/common';
import { MedicationIpdService } from './medication_ipd.service';
import { MedicationIpdController } from './medication_ipd.controller';

@Module({
  controllers: [MedicationIpdController],
  providers: [MedicationIpdService],
})
export class MedicationIpdModule {}