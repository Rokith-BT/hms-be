import { Module } from '@nestjs/common';
import { InternalOpdMedicationMedicationDoseService } from './internal-opd-medication-medication_dose.service';
import { InternalOpdMedicationMedicationDoseController } from './internal-opd-medication-medication_dose.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternalOpdMedicationMedicationDose } from './entities/internal-opd-medication-medication_dose.entity';

@Module({

  imports: [TypeOrmModule.forFeature([InternalOpdMedicationMedicationDose])],


  controllers: [InternalOpdMedicationMedicationDoseController],
  providers: [InternalOpdMedicationMedicationDoseService],
})
export class InternalOpdMedicationMedicationDoseModule { }
