import { PartialType } from '@nestjs/swagger';
import { CreatePhpIncomeReportDto } from './create-php-income-report.dto';

export class UpdatePhpIncomeReportDto extends PartialType(CreatePhpIncomeReportDto) {}
