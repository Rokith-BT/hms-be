import { Module } from '@nestjs/common';
import { InternalOpdOverviewConsultantDoctorService } from './internal-opd-overview-consultant_doctor.service';
import { InternalOpdOverviewConsultantDoctorController } from './internal-opd-overview-consultant_doctor.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternalOpdOverviewConsultantDoctor } from './entities/internal-opd-overview-consultant_doctor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InternalOpdOverviewConsultantDoctor])],

  controllers: [InternalOpdOverviewConsultantDoctorController],
  providers: [InternalOpdOverviewConsultantDoctorService, DynamicDatabaseService],
})
export class InternalOpdOverviewConsultantDoctorModule { }
