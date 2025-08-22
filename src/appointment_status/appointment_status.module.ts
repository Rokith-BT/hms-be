import { Module } from '@nestjs/common';
import { AppointmentStatusService } from './appointment_status.service';
import { AppointmentStatusController } from './appointment_status.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentStatus } from './entities/appointment_status.entity';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  imports: [TypeOrmModule.forFeature([AppointmentStatus])],

  controllers: [AppointmentStatusController],
  providers: [AppointmentStatusService, DynamicDatabaseService],
})
export class AppointmentStatusModule {}
