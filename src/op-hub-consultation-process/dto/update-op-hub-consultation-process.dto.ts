import { PartialType } from '@nestjs/swagger';
import { CreateOpHubConsultationProcessDto } from './create-op-hub-consultation-process.dto';

export class UpdateOpHubConsultationProcessDto extends PartialType(CreateOpHubConsultationProcessDto) {}
