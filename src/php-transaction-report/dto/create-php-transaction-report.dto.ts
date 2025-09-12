export class CreatePhpTransactionReportDto {
    startDate: string;
    endDate: string;    
}
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  txn_id: string;

  @ApiProperty()
  pg_ref_id: string;

  @ApiProperty()
  bank_ref_id: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  section: string;

  @ApiProperty()
  patient_id: number;

  @ApiProperty()
  case_reference_id: number;

  @ApiProperty()
  patient_charges_id: number;

  @ApiProperty()
  opd_id: number;

  @ApiPropertyOptional()
  ipd_id?: number;

  @ApiPropertyOptional()
  pharmacy_bill_basic_id?: number;

  @ApiPropertyOptional()
  pathology_billing_id?: number;

  @ApiPropertyOptional()
  radiology_billing_id?: number;

  @ApiPropertyOptional()
  blood_donor_cycle_id?: number;

  @ApiPropertyOptional()
  blood_issue_id?: number;

  @ApiPropertyOptional()
  ambulance_call_id?: number;

  @ApiProperty()
  appointment_id: number;

  @ApiPropertyOptional()
  attachment?: string;

  @ApiPropertyOptional()
  attachment_name?: string;

  @ApiPropertyOptional()
  amount_type?: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  payment_mode: string;

  @ApiPropertyOptional()
  cheque_no?: string;

  @ApiPropertyOptional()
  cheque_date?: string;

  @ApiProperty()
  payment_date: string;

  @ApiPropertyOptional()
  note?: string;

  @ApiPropertyOptional()
  received_by?: string;

  @ApiProperty()
  created_at: string;

  @ApiPropertyOptional()
  payment_gateway?: string;

  @ApiPropertyOptional()
  payment_id?: string;

  @ApiPropertyOptional()
  payment_reference_number?: string;

  @ApiPropertyOptional()
  temp_appt_payment_gateway?: string;

  @ApiPropertyOptional()
  temp_appt_payment_id?: string;

  @ApiPropertyOptional()
  temp_appt_payment_reference_number?: string;

  @ApiProperty()
  temp_appt_amount: number;

  @ApiProperty()
  ward: string;

  @ApiProperty()
  reference: number;

  @ApiProperty()
  module_id: number;

  @ApiProperty()
  patient_name: string;

  @ApiProperty()
  head: string;

  @ApiProperty()
  module_no: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  surname?: string;

  @ApiPropertyOptional()
  employee_id?: number;
}

export class CreatePhpTransactionReportResponseDto {
  @ApiProperty()
  total: number;

  @ApiProperty({ type: [PaymentDto] })
  details: PaymentDto[];
}