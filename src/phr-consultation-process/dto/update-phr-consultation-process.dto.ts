import { PartialType } from '@nestjs/swagger';
import { CreatePhrConsultationProcessDto } from './create-phr-consultation-process.dto';

export class UpdatePhrConsultationProcessDto extends PartialType(CreatePhrConsultationProcessDto) {}
