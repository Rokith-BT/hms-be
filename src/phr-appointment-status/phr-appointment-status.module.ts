import { Module } from '@nestjs/common';
import { PhrAppointmentStatusService } from './phr-appointment-status.service';
import { PhrAppointmentStatusController } from './phr-appointment-status.controller';

@Module({
  controllers: [PhrAppointmentStatusController],
  providers: [PhrAppointmentStatusService],
})
export class PhrAppointmentStatusModule {}
