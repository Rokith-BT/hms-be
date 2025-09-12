import { Module } from '@nestjs/common';
import { OpHubClinicalNotesService } from './op-hub-clinical-notes.service';
import { OpHubClinicalNotesController } from './op-hub-clinical-notes.controller';

@Module({
  controllers: [OpHubClinicalNotesController],
  providers: [OpHubClinicalNotesService],
})
export class OpHubClinicalNotesModule {}
