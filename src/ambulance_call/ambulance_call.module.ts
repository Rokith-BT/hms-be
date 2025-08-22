import { Module } from '@nestjs/common';
import { AmbulanceCallService } from './ambulance_call.service';
import { AmbulanceCallController } from './ambulance_call.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  controllers: [AmbulanceCallController],
  providers: [AmbulanceCallService,DynamicDatabaseService],
})
export class AmbulanceCallModule {}
