import { Module } from '@nestjs/common';
import { InternalAppointmentShiftService } from './internal-appointment-shift.service';
import { InternalAppointmentShiftController } from './internal-appointment-shift.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
import { InternalAppointmentCharge } from 'src/internal-appointment-charges/entities/internal-appointment-charge.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([InternalAppointmentCharge])],

  controllers: [InternalAppointmentShiftController],
  providers: [InternalAppointmentShiftService, DynamicDatabaseService],
})
export class InternalAppointmentShiftModule { }
