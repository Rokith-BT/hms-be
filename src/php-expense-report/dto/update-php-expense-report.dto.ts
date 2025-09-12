import { PartialType } from '@nestjs/swagger';
import { CreatePhpExpenseReportDto } from './create-php-expense-report.dto';

export class UpdatePhpExpenseReportDto extends PartialType(CreatePhpExpenseReportDto) {}
