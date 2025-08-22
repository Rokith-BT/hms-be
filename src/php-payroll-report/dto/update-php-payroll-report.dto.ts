import { PartialType } from '@nestjs/swagger';
import { CreatePhpPayrollReportDto } from './create-php-payroll-report.dto';

export class UpdatePhpPayrollReportDto extends PartialType(CreatePhpPayrollReportDto) {}
