import { Module } from '@nestjs/common';
import { SetupPharmacyDoseIntervalService } from './setup-pharmacy-dose_interval.service';
import { SetupPharmacyDoseIntervalController } from './setup-pharmacy-dose_interval.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
import { SetupPharmacyDoseInterval } from './entities/setup-pharmacy-dose_interval.entity';

@Module({
  imports:[ TypeOrmModule.forFeature([SetupPharmacyDoseInterval])],

  controllers: [SetupPharmacyDoseIntervalController],
  providers: [SetupPharmacyDoseIntervalService,DynamicDatabaseService],
})
export class SetupPharmacyDoseIntervalModule {}
