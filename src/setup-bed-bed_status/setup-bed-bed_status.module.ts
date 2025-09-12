import { Module } from '@nestjs/common';
import { SetupBedBedStatusService } from './setup-bed-bed_status.service';
import { SetupBedBedStatusController } from './setup-bed-bed_status.controller';

@Module({
  controllers: [SetupBedBedStatusController],
  providers: [SetupBedBedStatusService],
})
export class SetupBedBedStatusModule {}
