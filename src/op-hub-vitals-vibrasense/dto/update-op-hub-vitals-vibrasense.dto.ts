import { PartialType } from '@nestjs/swagger';
import { CreateOpHubVitalsVibrasenseDto } from './create-op-hub-vitals-vibrasense.dto';

export class UpdateOpHubVitalsVibrasenseDto extends PartialType(CreateOpHubVitalsVibrasenseDto) {}
