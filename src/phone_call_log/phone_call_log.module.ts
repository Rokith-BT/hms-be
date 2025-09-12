import { Module } from '@nestjs/common';
import { PhoneCallLogService } from './phone_call_log.service';
import { PhoneCallLogController } from './phone_call_log.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  controllers: [PhoneCallLogController],
  providers: [PhoneCallLogService,DynamicDatabaseService],
})
export class PhoneCallLogModule {}
