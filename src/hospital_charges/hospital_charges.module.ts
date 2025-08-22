import { Module } from '@nestjs/common';
import { HospitalChargesService } from './hospital_charges.service';
import { HospitalChargesController } from './hospital_charges.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HospitalCharge } from './entities/hospital_charge.entity';

@Module({
  imports:[ TypeOrmModule.forFeature([HospitalCharge])],

  
  controllers: [HospitalChargesController],
  providers: [HospitalChargesService,DynamicDatabaseService],
})
export class HospitalChargesModule {}
