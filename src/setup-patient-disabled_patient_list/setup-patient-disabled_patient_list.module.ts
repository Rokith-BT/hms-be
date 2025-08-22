import { Module } from '@nestjs/common';
import { SetupPatientDisabledPatientListService } from './setup-patient-disabled_patient_list.service';
import { SetupPatientDisabledPatientListController } from './setup-patient-disabled_patient_list.controller';
 
@Module({
  controllers: [SetupPatientDisabledPatientListController],
  providers: [SetupPatientDisabledPatientListService],
})
export class SetupPatientDisabledPatientListModule {}