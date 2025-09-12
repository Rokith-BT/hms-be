import { PartialType } from '@nestjs/swagger';
import { CreateOpHubTokenInitiateDto } from './create-op-hub-token-initiate.dto';

export class UpdateOpHubTokenInitiateDto extends PartialType(CreateOpHubTokenInitiateDto) {}
