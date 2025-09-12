import { Module } from '@nestjs/common';
import { OpdMedicationService } from './opd-medication.service';
import { MedicationOpdController } from './opd-medication.controller';

@Module({
  controllers: [MedicationOpdController],
  providers: [OpdMedicationService],
})
export class OpdMedicationModule { }
