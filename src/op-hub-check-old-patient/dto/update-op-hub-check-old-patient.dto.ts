import { PartialType } from '@nestjs/swagger';
import { CreateOpHubCheckOldPatientDto } from './create-op-hub-check-old-patient.dto';

export class UpdateOpHubCheckOldPatientDto extends PartialType(CreateOpHubCheckOldPatientDto) {}
