import { Module } from '@nestjs/common';
import { OpHubAppointmentService } from './op-hub-appointment.service';
import { OpHubAppointmentController } from './op-hub-appointment.controller';
import { FaceAuthService } from 'src/face-auth/face-auth.service';

@Module({
  controllers: [OpHubAppointmentController],
  providers: [OpHubAppointmentService,FaceAuthService],
})
export class OpHubAppointmentModule {}
