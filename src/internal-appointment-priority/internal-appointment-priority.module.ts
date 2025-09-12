import { Module } from '@nestjs/common';
import { InternalAppointmentPriorityService } from './internal-appointment-priority.service';
import { InternalAppointmentPriorityController } from './internal-appointment-priority.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternalAppointmentPriority } from './entities/internal-appointment-priority.entity';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  imports: [TypeOrmModule.forFeature([InternalAppointmentPriority])],

  controllers: [InternalAppointmentPriorityController],
  providers: [InternalAppointmentPriorityService, DynamicDatabaseService],
})
export class InternalAppointmentPriorityModule { }
