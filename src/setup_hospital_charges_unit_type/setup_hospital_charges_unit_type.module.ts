import { Module } from '@nestjs/common';
import { unit_typeService } from './setup_hospital_charges_unit_type.service';
import { unit_typecontroller } from './setup_hospital_charges_unit_type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetupHospitalChargesUnitType } from './entities/setup_hospital_charges_unit_type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SetupHospitalChargesUnitType])],

  providers: [unit_typeService],
  controllers: [unit_typecontroller],
})
export class SetupHospitalChargesUnitTypeModule { }
