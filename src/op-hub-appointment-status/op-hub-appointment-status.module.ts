import { Module } from '@nestjs/common';
import { OpHubAppointmentStatusService } from './op-hub-appointment-status.service';
import { OpHubAppointmentStatusController } from './op-hub-appointment-status.controller';

@Module({
  controllers: [OpHubAppointmentStatusController],
  providers: [OpHubAppointmentStatusService],
})
export class OpHubAppointmentStatusModule {}
