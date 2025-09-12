import { PartialType } from '@nestjs/swagger';
import { CreateOpHubUnlinkAbhaFromPatientDto } from './create-op-hub-unlink-abha-from-patient.dto';

export class UpdateOpHubUnlinkAbhaFromPatientDto extends PartialType(CreateOpHubUnlinkAbhaFromPatientDto) {}
