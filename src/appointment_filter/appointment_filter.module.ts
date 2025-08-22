import { Module } from '@nestjs/common';
import { AppointmentFilterService } from './appointment_filter.service';
import { AppointmentFilterController } from './appointment_filter.controller';

@Module({
  controllers: [AppointmentFilterController],
  providers: [AppointmentFilterService],
})
export class AppointmentFilterModule {}
