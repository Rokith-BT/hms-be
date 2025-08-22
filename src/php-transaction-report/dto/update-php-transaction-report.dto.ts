import { PartialType } from '@nestjs/swagger';
import { CreatePhpTransactionReportDto } from './create-php-transaction-report.dto';

export class UpdatePhpTransactionReportDto extends PartialType(CreatePhpTransactionReportDto) {}
