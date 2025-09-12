import { PartialType } from '@nestjs/swagger';
import { CreateOpHubDoctorSlotShiftServiceDto } from './create-op-hub-doctor-slot-shift-service.dto';

export class UpdateOpHubDoctorSlotShiftServiceDto extends PartialType(CreateOpHubDoctorSlotShiftServiceDto) {}
