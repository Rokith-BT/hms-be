import { Module } from '@nestjs/common';
import { PhpRecordsService } from './php-records.service';
import { PhpRecordsController } from './php-records.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  controllers: [PhpRecordsController],
  providers: [PhpRecordsService,DynamicDatabaseService],
})
export class PhpRecordsModule {}
