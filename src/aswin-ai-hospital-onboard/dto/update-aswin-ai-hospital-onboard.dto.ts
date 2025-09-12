import { PartialType } from '@nestjs/swagger';
import { CreateAswinAiHospitalOnboardDto } from './create-aswin-ai-hospital-onboard.dto';

export class UpdateAswinAiHospitalOnboardDto extends PartialType(CreateAswinAiHospitalOnboardDto) {}
