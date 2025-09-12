import { Module } from '@nestjs/common';
import { InternalAppointmentSlotService } from './internal-appointment-slot.service';
import { InternalAppointmentSlotController } from './internal-appointment-slot.controller';

@Module({
  controllers: [InternalAppointmentSlotController],
  providers: [InternalAppointmentSlotService],
})
export class InternalAppointmentSlotModule { }
