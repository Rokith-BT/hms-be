import { PartialType } from '@nestjs/swagger';
import { CreateOpHubClinicalNoteDto } from './create-op-hub-clinical-note.dto';

export class UpdateOpHubClinicalNoteDto extends PartialType(CreateOpHubClinicalNoteDto) {}
