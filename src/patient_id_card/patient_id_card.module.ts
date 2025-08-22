import { Module } from '@nestjs/common';
import { PatientIdCardService } from './patient_id_card.service';
import { PatientIdCardController } from './patient_id_card.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  controllers: [PatientIdCardController],
  providers: [PatientIdCardService,DynamicDatabaseService],
})
export class PatientIdCardModule {}
