import { Module } from '@nestjs/common';
import { AddAppointmentDoctorWiseService } from './add-appointment-doctor_wise.service';
import { AddAppointmentDoctorWiseController } from './add-appointment-doctor_wise.controller';

@Module({
  controllers: [AddAppointmentDoctorWiseController],
  providers: [AddAppointmentDoctorWiseService],
})
export class AddAppointmentDoctorWiseModule {}
