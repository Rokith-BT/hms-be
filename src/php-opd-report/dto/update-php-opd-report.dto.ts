import { PartialType } from '@nestjs/swagger';
import { CreatePhpOpdReportDto } from './create-php-opd-report.dto';

export class UpdatePhpOpdReportDto extends PartialType(CreatePhpOpdReportDto) {}
