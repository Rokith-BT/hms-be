import { Module } from '@nestjs/common';
import { EmrPatientDetailsService } from './emr_patient_details.service';
import { EmrPatientDetailsController } from './emr_patient_details.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmrPatientDetail } from './entities/emr_patient_detail.entity';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  imports:[ TypeOrmModule.forFeature([EmrPatientDetail])],

  controllers: [EmrPatientDetailsController],
  providers: [EmrPatientDetailsService],
})
export class EmrPatientDetailsModule {}
