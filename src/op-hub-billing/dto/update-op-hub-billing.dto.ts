import { ApiProperty } from '@nestjs/swagger';

export class PatientTransactionDto {
  @ApiProperty({ example: 23, description: 'Unique ID of the patient' })
  patientId: number;

  @ApiProperty({ example: 'new patient', description: 'Name of the patient' })
  patient_name: string;

  @ApiProperty({ example: 'TRID42', description: 'Transaction ID for the payment' })
  transaction_id: string;

  @ApiProperty({ example: '2025-03-09', description: 'Date of the payment' })
  payment_date: string;

  @ApiProperty({ example: 'cash', description: 'Mode of payment' })
  payment_mode: string;

  @ApiProperty({ example: 118, description: 'Amount paid in the transaction' })
  amount: number;
}
export class PatientTransactionDtoWithCount {
  @ApiProperty({ example: 1, description: 'Total number of patients' })
  Totalcount: number;

  @ApiProperty({ example: 1, description: 'Total Amount' })
  TotalAmount: number;

  @ApiProperty({ type: [PatientTransactionDto] })
  details: PatientTransactionDto[];
}
