import { PartialType } from '@nestjs/swagger';
import { CreatePhpIpdReportDto } from './create-php-ipd-report.dto';

export class UpdatePhpIpdReportDto extends PartialType(CreatePhpIpdReportDto) {}
