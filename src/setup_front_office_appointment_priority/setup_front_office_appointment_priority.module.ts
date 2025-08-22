import { Module } from '@nestjs/common';
import { SetupFrontOfficeAppointmentPriorityService } from './setup_front_office_appointment_priority.service';
import { SetupFrontOfficeAppointmentPriorityController } from './setup_front_office_appointment_priority.controller';

@Module({
  controllers: [SetupFrontOfficeAppointmentPriorityController],
  providers: [SetupFrontOfficeAppointmentPriorityService],
})
export class SetupFrontOfficeAppointmentPriorityModule { }
