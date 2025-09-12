import { Module } from '@nestjs/common';
import { AddAppointmentService } from './add-appointment.service';
import { AddAppointmentController } from './add-appointment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
import { AddAppointment } from './entities/add-appointment.entity';
import { FaceAuthService } from 'src/face-auth/face-auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([AddAppointment])],

  controllers: [AddAppointmentController],
  providers: [AddAppointmentService, DynamicDatabaseService,FaceAuthService],
})
export class AddAppointmentModule {}
