import { Module } from '@nestjs/common';
import { SetupHospitalChargesChargeTypeModuleService } from './setup-hospital-charges_charge_type_module.service';
import { SetupHospitalChargesChargeTypeModuleController } from './setup-hospital-charges_charge_type_module.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetupHospitalChargesChargeTypeModule } from './entities/setup-hospital-charges_charge_type_module.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SetupHospitalChargesChargeTypeModule])],

  controllers: [SetupHospitalChargesChargeTypeModuleController],
  providers: [
    SetupHospitalChargesChargeTypeModuleService  ],
})
export class SetupHospitalChargesChargeTypeModuleModule {}
