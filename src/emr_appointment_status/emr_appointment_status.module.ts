import { Module } from '@nestjs/common';
import { EmrAppointmentStatusService } from './emr_appointment_status.service';
import { EmrAppointmentStatusController } from './emr_appointment_status.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  controllers: [EmrAppointmentStatusController],
  providers: [EmrAppointmentStatusService,DynamicDatabaseService],
})
export class EmrAppointmentStatusModule {}
