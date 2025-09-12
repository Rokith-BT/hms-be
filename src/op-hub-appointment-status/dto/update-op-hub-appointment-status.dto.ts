import { PartialType } from '@nestjs/swagger';
import { CreateOpHubAppointmentStatusDto } from './create-op-hub-appointment-status.dto';

export class UpdateOpHubAppointmentStatusDto extends PartialType(CreateOpHubAppointmentStatusDto) {}
