import { Module } from '@nestjs/common';
import { OpHubConsultationProcessService } from './op-hub-consultation-process.service';
import { OpHubConsultationProcessController } from './op-hub-consultation-process.controller';

@Module({
  controllers: [OpHubConsultationProcessController],
  providers: [OpHubConsultationProcessService],
})
export class OpHubConsultationProcessModule {}
