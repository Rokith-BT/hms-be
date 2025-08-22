import { PartialType } from '@nestjs/swagger';
import { CreateOpHubCompleteAndCloseConsultationDto } from './create-op-hub-complete-and-close-consultation.dto';

export class UpdateOpHubCompleteAndCloseConsultationDto extends PartialType(CreateOpHubCompleteAndCloseConsultationDto) {}
