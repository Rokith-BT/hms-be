import { Module } from '@nestjs/common';
import { InternalOpdOverviewVisitsService } from './internal-opd-overview-visits.service';
import { InternalOpdOverviewVisitsController } from './internal-opd-overview-visits.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternalOpdOverviewVisit } from './entities/internal-opd-overview-visit.entity';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  imports: [TypeOrmModule.forFeature([InternalOpdOverviewVisit])],

  controllers: [InternalOpdOverviewVisitsController],
  providers: [InternalOpdOverviewVisitsService, DynamicDatabaseService],
})
export class InternalOpdOverviewVisitsModule { }
