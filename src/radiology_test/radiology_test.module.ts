import { Module } from '@nestjs/common';
import { RadiologyTestService } from './radiology_test.service';
import { RadiologyTestController } from './radiology_test.controller';

@Module({
  controllers: [RadiologyTestController],
  providers: [RadiologyTestService],
})
export class RadiologyTestModule {}
