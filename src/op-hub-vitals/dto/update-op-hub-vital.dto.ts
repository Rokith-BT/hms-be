import { PartialType } from '@nestjs/swagger';
import { CreateOpHubVitalDto } from './create-op-hub-vital.dto';

export class UpdateOpHubVitalDto extends PartialType(CreateOpHubVitalDto) {}
