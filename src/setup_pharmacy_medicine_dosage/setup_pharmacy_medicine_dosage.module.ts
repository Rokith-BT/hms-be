import { Module } from '@nestjs/common';
import { SetupPharmacyMedicineDosageService } from './setup_pharmacy_medicine_dosage.service';
import { SetupPharmacyMedicineDosageController } from './setup_pharmacy_medicine_dosage.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetupPharmacyMedicineDosage } from './entities/setup_pharmacy_medicine_dosage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SetupPharmacyMedicineDosage])],

  controllers: [SetupPharmacyMedicineDosageController],
  providers: [SetupPharmacyMedicineDosageService],
})
export class SetupPharmacyMedicineDosageModule { }
