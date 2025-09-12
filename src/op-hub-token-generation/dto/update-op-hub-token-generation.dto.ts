import { PartialType } from '@nestjs/swagger';
import { CreateOpHubTokenGenerationDto } from './create-op-hub-token-generation.dto';

export class UpdateOpHubTokenGenerationDto extends PartialType(CreateOpHubTokenGenerationDto) {}
