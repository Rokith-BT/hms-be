import { Module } from '@nestjs/common';
import { OpHubPatientAppointmentListService } from './op-hub-patient-appointment-list.service';
import { OpHubPatientAppointmentListController } from './op-hub-patient-appointment-list.controller';

@Module({
  controllers: [OpHubPatientAppointmentListController],
  providers: [OpHubPatientAppointmentListService],
})
export class OpHubPatientAppointmentListModule {}
