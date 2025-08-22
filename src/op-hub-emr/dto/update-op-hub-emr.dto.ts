import { PartialType } from '@nestjs/swagger';
import { CreateOpHubEmrDto } from './create-op-hub-emr.dto';

export class UpdateOpHubEmrDto extends PartialType(CreateOpHubEmrDto) {}
