import { Module } from '@nestjs/common';
import { CheckForDuplicateAppointmentService } from './check-for-duplicate-appointment.service';
import { CheckForDuplicateAppointmentController } from './check-for-duplicate-appointment.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  controllers: [CheckForDuplicateAppointmentController],
  providers: [CheckForDuplicateAppointmentService,DynamicDatabaseService],
})
export class CheckForDuplicateAppointmentModule {}
