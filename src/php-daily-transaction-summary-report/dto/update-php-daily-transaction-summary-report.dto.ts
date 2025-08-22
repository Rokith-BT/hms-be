import { PartialType } from '@nestjs/swagger';
import { CreatePhpDailyTransactionSummaryReportDto } from './create-php-daily-transaction-summary-report.dto';

export class UpdatePhpDailyTransactionSummaryReportDto extends PartialType(CreatePhpDailyTransactionSummaryReportDto) {}
