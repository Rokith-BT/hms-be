import { Module } from '@nestjs/common';
import { InternalOpdOverviewService } from './internal-opd-overview.service';
import { InternalOpdOverviewController } from './internal-opd-overview.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternalOpdOverview } from './entities/internal-opd-overview.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InternalOpdOverview])],

  controllers: [InternalOpdOverviewController],
  providers: [InternalOpdOverviewService, DynamicDatabaseService],
})
export class InternalOpdOverviewModule { }
