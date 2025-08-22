import { PartialType } from '@nestjs/swagger';
import { CreateOverallPaymentSummaryDto } from './create-overall-payment-summary.dto';

export class UpdateOverallPaymentSummaryDto extends PartialType(CreateOverallPaymentSummaryDto) {}
