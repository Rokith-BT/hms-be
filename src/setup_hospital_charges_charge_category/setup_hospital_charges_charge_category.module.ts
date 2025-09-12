import { Module } from '@nestjs/common';
import { SetupHospitalChargesChargeCategoryService } from './setup_hospital_charges_charge_category.service';
import { SetupHospitalChargesChargeCategoryController } from './setup_hospital_charges_charge_category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetupHospitalChargesChargeCategory } from './entities/setup_hospital_charges_charge_category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SetupHospitalChargesChargeCategory])],

  controllers: [SetupHospitalChargesChargeCategoryController],
  providers: [
    SetupHospitalChargesChargeCategoryService
  ],
})
export class SetupHospitalChargesChargeCategoryModule { }
