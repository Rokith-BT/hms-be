import { Module } from '@nestjs/common';
import { PhrAppointmentService } from './phr-appointment.service';
import { PhrAppointmentController } from './phr-appointment.controller';
import { FaceAuthService } from 'src/face-auth/face-auth.service';

@Module({
  controllers: [PhrAppointmentController],
  providers: [PhrAppointmentService,FaceAuthService],
})
export class PhrAppointmentModule {}
