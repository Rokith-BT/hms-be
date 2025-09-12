import { Module } from '@nestjs/common';
import { NurseNotesIpdService } from './nurse_notes_ipd.service';
import { NurseNotesIpdController } from './nurse_notes_ipd.controller';

@Module({
  controllers: [NurseNotesIpdController],
  providers: [NurseNotesIpdService],
})
export class NurseNotesIpdModule {}
