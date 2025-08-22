import { Module } from '@nestjs/common';
import { InternalOpdMedicationMedicationNameService } from './internal-opd-medication-medication_name.service';
import { InternalOpdMedicationMedicationNameController } from './internal-opd-medication-medication_name.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternalOpdMedicationMedicationName } from './entities/internal-opd-medication-medication_name.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InternalOpdMedicationMedicationName])],


  controllers: [InternalOpdMedicationMedicationNameController],
  providers: [InternalOpdMedicationMedicationNameService],
})
export class InternalOpdMedicationMedicationNameModule { }
