import { PartialType } from '@nestjs/swagger';
import { CreateOpHubPatientAppointmentListDto } from './create-op-hub-patient-appointment-list.dto';

export class UpdateOpHubPatientAppointmentListDto extends PartialType(CreateOpHubPatientAppointmentListDto) {}
