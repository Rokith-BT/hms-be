import { PartialType } from '@nestjs/swagger';
import { CreatePhpCollectionByReportDto } from './create-php-collection_by-report.dto';

export class UpdatePhpCollectionByReportDto extends PartialType(CreatePhpCollectionByReportDto) {}
