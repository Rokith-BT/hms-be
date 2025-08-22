import { Module } from '@nestjs/common';
import { EmrOpdFilterService } from './emr_opd_filter.service';
import { EmrOpdFilterController } from './emr_opd_filter.controller';

@Module({
  controllers: [EmrOpdFilterController],
  providers: [EmrOpdFilterService],
})
export class EmrOpdFilterModule {}
