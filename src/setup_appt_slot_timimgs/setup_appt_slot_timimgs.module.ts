import { Module } from '@nestjs/common';
import { SetupApptSlotTimimgsService } from './setup_appt_slot_timimgs.service';
import { SetupApptSlotTimimgsController } from './setup_appt_slot_timimgs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetupApptSlotTimimg } from './entities/setup_appt_slot_timimg.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SetupApptSlotTimimg])],

  controllers: [SetupApptSlotTimimgsController],
  providers: [SetupApptSlotTimimgsService],
})
export class SetupApptSlotTimimgsModule {}
