import { Module } from '@nestjs/common';
import { PathologyTestService } from './pathology_test.service';
import { PathologyTestController } from './pathology_test.controller';

@Module({
  controllers: [PathologyTestController],
  providers: [PathologyTestService],
})
export class PathologyTestModule {}
