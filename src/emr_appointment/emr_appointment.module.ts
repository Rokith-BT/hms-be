import { Module } from '@nestjs/common';
import { EmrAppointmentService } from './emr_appointment.service';
import { EmrAppointmentController } from './emr_appointment.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmrAppointment } from './entities/emr_appointment.entity';
import { FaceAuthService } from 'src/face-auth/face-auth.service';

@Module({
  imports:[ TypeOrmModule.forFeature([EmrAppointment])],

  controllers: [EmrAppointmentController],
  providers: [EmrAppointmentService,DynamicDatabaseService,FaceAuthService],
})
export class EmrAppointmentModule {}
