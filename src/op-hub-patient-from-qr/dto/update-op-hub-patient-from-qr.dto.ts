import { PartialType } from '@nestjs/swagger';
import { CreateOpHubPatientFromQrDto } from './create-op-hub-patient-from-qr.dto';

export class UpdateOpHubPatientFromQrDto extends PartialType(CreateOpHubPatientFromQrDto) {}
