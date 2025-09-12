import { PartialType } from '@nestjs/swagger';
import { CreatePhrHospitalDto } from './create-phr-hospital.dto';

export class UpdatePhrHospitalDto extends PartialType(CreatePhrHospitalDto) {}
