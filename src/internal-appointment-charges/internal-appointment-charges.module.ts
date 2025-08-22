import { Module } from '@nestjs/common';
import { InternalAppointmentChargesService } from './internal-appointment-charges.service';
import { InternalAppointmentChargesController } from './internal-appointment-charges.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternalAppointmentCharge } from './entities/internal-appointment-charge.entity';

@Module({

  imports: [TypeOrmModule.forFeature([InternalAppointmentCharge])],

  controllers: [InternalAppointmentChargesController],
  providers: [InternalAppointmentChargesService, DynamicDatabaseService],
})
export class InternalAppointmentChargesModule { }
