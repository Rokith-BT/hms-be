import { PartialType } from '@nestjs/swagger';
import { CreateOpHubPrescriptionDto } from './create-op-hub-prescription.dto';

export class UpdateOpHubPrescriptionDto extends PartialType(CreateOpHubPrescriptionDto) {}
