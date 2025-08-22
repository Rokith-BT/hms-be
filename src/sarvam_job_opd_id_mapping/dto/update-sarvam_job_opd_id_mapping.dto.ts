import { PartialType } from '@nestjs/swagger';
import { CreateSarvamJobOpdIdMappingDto } from './create-sarvam_job_opd_id_mapping.dto';

export class UpdateSarvamJobOpdIdMappingDto extends PartialType(CreateSarvamJobOpdIdMappingDto) {}
