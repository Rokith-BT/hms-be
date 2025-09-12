import { PartialType } from '@nestjs/swagger';
import { CreateOpHubCheckForDuplicateAppointmentDto } from './create-op-hub-check-for-duplicate-appointment.dto';

export class UpdateOpHubCheckForDuplicateAppointmentDto extends PartialType(CreateOpHubCheckForDuplicateAppointmentDto) {}
