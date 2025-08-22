import { Module } from '@nestjs/common';
import { InternalAppointmentStaffService } from './internal-appointment-staff.service';
import { InternalAppointmentStaffController } from './internal-appointment-staff.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
import { InternalAppointmentStaff } from './entities/internal-appointment-staff.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InternalAppointmentStaff])],

  controllers: [InternalAppointmentStaffController],
  providers: [InternalAppointmentStaffService, DynamicDatabaseService],
})
export class InternalAppointmentStaffModule { }
