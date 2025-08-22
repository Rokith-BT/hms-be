import { Module } from '@nestjs/common';
import { SarvamJobOpdIdMappingService } from './sarvam_job_opd_id_mapping.service';
import { SarvamJobOpdIdMappingController } from './sarvam_job_opd_id_mapping.controller';

@Module({
  controllers: [SarvamJobOpdIdMappingController],
  providers: [SarvamJobOpdIdMappingService],
})
export class SarvamJobOpdIdMappingModule {}
