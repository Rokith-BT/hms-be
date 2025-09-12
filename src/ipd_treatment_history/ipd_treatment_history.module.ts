import { Module } from '@nestjs/common';
import { IpdTreatmentHistoryService } from './ipd_treatment_history.service';
import { IpdTreatmentHistoryController } from './ipd_treatment_history.controller';

@Module({
  controllers: [IpdTreatmentHistoryController],
  providers: [IpdTreatmentHistoryService],
})
export class IpdTreatmentHistoryModule {}
