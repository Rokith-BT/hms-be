import { Module } from '@nestjs/common';
import { AddAppointmentPatientQueueService } from './add-appointment-patient_queue.service';
import { AddAppointmentPatientQueueController } from './add-appointment-patient_queue.controller';

@Module({
  controllers: [AddAppointmentPatientQueueController],
  providers: [AddAppointmentPatientQueueService],
})
export class AddAppointmentPatientQueueModule {}
