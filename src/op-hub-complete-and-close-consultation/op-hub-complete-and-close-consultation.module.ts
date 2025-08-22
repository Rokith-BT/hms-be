import { Module } from '@nestjs/common';
import { OpHubCompleteAndCloseConsultationService } from './op-hub-complete-and-close-consultation.service';
import { OpHubCompleteAndCloseConsultationController } from './op-hub-complete-and-close-consultation.controller';

@Module({
  controllers: [OpHubCompleteAndCloseConsultationController],
  providers: [OpHubCompleteAndCloseConsultationService],
})
export class OpHubCompleteAndCloseConsultationModule {}
