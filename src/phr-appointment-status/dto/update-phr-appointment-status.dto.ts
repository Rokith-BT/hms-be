import { PartialType } from '@nestjs/swagger';
import { CreatePhrAppointmentStatusDto } from './create-phr-appointment-status.dto';

export class UpdatePhrAppointmentStatusDto extends PartialType(CreatePhrAppointmentStatusDto) {}
