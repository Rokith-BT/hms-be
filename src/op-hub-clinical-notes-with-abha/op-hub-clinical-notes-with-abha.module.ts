import { Module } from '@nestjs/common';
import { OpHubClinicalNotesWithAbhaService } from './op-hub-clinical-notes-with-abha.service';
import { OpHubClinicalNotesWithAbhaController } from './op-hub-clinical-notes-with-abha.controller';

@Module({
  controllers: [OpHubClinicalNotesWithAbhaController],
  providers: [OpHubClinicalNotesWithAbhaService],
})
export class OpHubClinicalNotesWithAbhaModule {}
