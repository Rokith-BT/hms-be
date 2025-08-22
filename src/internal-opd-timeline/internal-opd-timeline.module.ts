import { Module } from '@nestjs/common';
import { InternalOpdTimelineService } from './internal-opd-timeline.service';
import { InternalOpdTimelineController } from './internal-opd-timeline.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternalOpdTimeline } from './entities/internal-opd-timeline.entity';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  imports: [TypeOrmModule.forFeature([InternalOpdTimeline])],

  controllers: [InternalOpdTimelineController],
  providers: [InternalOpdTimelineService, DynamicDatabaseService],
})
export class InternalOpdTimelineModule { }
