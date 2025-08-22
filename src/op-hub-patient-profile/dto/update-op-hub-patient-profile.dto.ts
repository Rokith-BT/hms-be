import { PartialType } from '@nestjs/swagger';
import { CreateOpHubPatientProfileDto } from './create-op-hub-patient-profile.dto';

export class UpdateOpHubPatientProfileDto extends PartialType(CreateOpHubPatientProfileDto) {}
