import { PartialType } from '@nestjs/swagger';
import { CreateOpHubLoginDto } from './create-op-hub-login.dto';

export class UpdateOpHubLoginDto extends PartialType(CreateOpHubLoginDto) {}
