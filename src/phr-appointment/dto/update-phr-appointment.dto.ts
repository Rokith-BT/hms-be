import { PartialType } from '@nestjs/swagger';
import { CreatePhrAppointmentDto } from './create-phr-appointment.dto';

export class UpdatePhrAppointmentDto extends PartialType(CreatePhrAppointmentDto) {}
