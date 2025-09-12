import { Module } from '@nestjs/common';
import { OpHubCheckForDuplicateAppointmentService } from './op-hub-check-for-duplicate-appointment.service';
import { OpHubCheckForDuplicateAppointmentController } from './op-hub-check-for-duplicate-appointment.controller';

@Module({
  controllers: [OpHubCheckForDuplicateAppointmentController],
  providers: [OpHubCheckForDuplicateAppointmentService],
})
export class OpHubCheckForDuplicateAppointmentModule {}
