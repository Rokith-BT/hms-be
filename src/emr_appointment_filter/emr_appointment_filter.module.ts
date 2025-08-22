import { Module } from '@nestjs/common';
import { EmrAppointmentFilterService } from './emr_appointment_filter.service';
import { EmrAppointmentFilterController } from './emr_appointment_filter.controller';

@Module({
  controllers: [EmrAppointmentFilterController],
  providers: [EmrAppointmentFilterService],
})
export class EmrAppointmentFilterModule {}
