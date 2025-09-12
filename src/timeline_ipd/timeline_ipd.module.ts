import { Module } from '@nestjs/common';
import { TimelineIpdService } from './timeline_ipd.service';
import { TimelineIpdController } from './timeline_ipd.controller';

@Module({
  controllers: [TimelineIpdController],
  providers: [TimelineIpdService],
})
export class TimelineIpdModule {}
