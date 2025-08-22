import { Module } from '@nestjs/common';
import { BedHistoryService } from './bed_history.service';
import { BedHistoryController } from './bed_history.controller';

@Module({
  controllers: [BedHistoryController],
  providers: [BedHistoryService],
})
export class BedHistoryModule {}