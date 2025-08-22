import { PartialType } from '@nestjs/swagger';
import { CreateOpHubDoctorDto } from './create-op-hub-doctor.dto';

export class UpdateOpHubDoctorDto extends PartialType(CreateOpHubDoctorDto) {}
