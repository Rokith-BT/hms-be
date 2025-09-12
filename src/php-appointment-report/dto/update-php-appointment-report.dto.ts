import { PartialType } from '@nestjs/swagger';
import { CreatePhpAppointmentReportDto } from './create-php-appointment-report.dto';

export class UpdatePhpAppointmentReportDto extends PartialType(CreatePhpAppointmentReportDto) {}
