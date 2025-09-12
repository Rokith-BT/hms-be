import { Module } from '@nestjs/common';
import { PhrConsultationProcessService } from './phr-consultation-process.service';
import { PhrConsultationProcessController } from './phr-consultation-process.controller';

@Module({
  controllers: [PhrConsultationProcessController],
  providers: [PhrConsultationProcessService],
})
export class PhrConsultationProcessModule {}
