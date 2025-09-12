import { PartialType } from '@nestjs/mapped-types';
import { CreateModulesPatientDto } from './create-modules_patient.dto';

export class UpdateModulesPatientDto extends PartialType(CreateModulesPatientDto) {}
