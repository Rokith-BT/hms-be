import { ApiProperty } from '@nestjs/swagger';
 
export class BillingDto {

  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  ipd_id: number;

  @ApiProperty({ example: 1 })
  opd_id: number;
 
  @ApiProperty({ example: '2025-04-19' })
  date: Date;

  @ApiProperty({ example: 1 })
  qty: number;

  @ApiProperty({ example: 1 })
  charge_id: number;

  @ApiProperty({ example: '100' })
  standard_charge: any;
 
  @ApiProperty({ example: '10' })
  tpa_charge: any;

  @ApiProperty({ example: '10' })
  tax: any;

  @ApiProperty({ example: '100' })
  apply_charge: any;

  @ApiProperty({ example: '100' })
  amount: any;

  @ApiProperty({ example: 'none' })
  note: string;
 
  @ApiProperty({ example: 1 })
  patient_id: any;

  @ApiProperty({ example: '2025-04-19' })
  created_at: Date;

  @ApiProperty({ example: 1 })
  Hospital_id: number;

  @ApiProperty({ example: 1 })
  hos_patient_charges_id: number;
 
  @ApiProperty({ example: 'paid' })
  payment_status: string;

  @ApiProperty({ example: '001' })
  txn_id: any;

  @ApiProperty({ example: 'REF001' })
  pg_ref_id: any;

  @ApiProperty({ example: 'BOI100' })
  bank_ref_id: any;
 
  @ApiProperty({ example: 'cash' })
  payment_mode: any;

  @ApiProperty({ example: '2025-04-19' })
  payment_date: Date;

  @ApiProperty({ example: '10.00' })
  totalTaxAmount: any;


}
 
export class CountDto {

    @ApiProperty({ example: '10' })
    details: BillingDto[];
 
    @ApiProperty({ example: '10' })
    total: number;

    @ApiProperty({ example: '10' })
    totalTaxAmount: any;

    @ApiProperty({ example: '10' })
    totalApplyCharge: any;

    @ApiProperty({ example: '10' })
    totalAmount: any;
    
    @ApiProperty({ example: '10' })
    paid: any;

    @ApiProperty({ example: '10' })
    unpaid: any;

    @ApiProperty({ example: '10' })
    patientInfo: any;
 
}