import { PartialType } from '@nestjs/swagger';
import { CreateOpHubInternalAppntDoctorDto } from './create-op-hub-internal-appnt-doctor.dto';

export class UpdateOpHubInternalAppntDoctorDto extends PartialType(CreateOpHubInternalAppntDoctorDto) {}
