import { ApiProperty } from '@nestjs/swagger';

export class IpdChargesDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '2025-04-17' })
  date: Date;

  @ApiProperty({ example: 1 })
  ipd_id: number;

  @ApiProperty({ example: 1 })
  opd_id: number;

  @ApiProperty({ example: 1 })
  qty: number;

  @ApiProperty({ example: 1 })
  charge_id: number;

  @ApiProperty({ example: 1 })
  patient_id: number;

  @ApiProperty({ example: '100.00' })
  standard_charge: any;

  @ApiProperty({ example: '10.00' })
  tpa_charge: any;

  @ApiProperty({ example: '10.00' })
  tax: any;

  @ApiProperty({ example: '100.00' })
  apply_charge: any;

  @ApiProperty({ example: '100.00' })
  amount: any;

  @ApiProperty({ example: 'none' })
  note: string;

  @ApiProperty({ example: '2025-04-17' })
  created_at: Date;

  @ApiProperty({ example: 'new charge' })
  name: string;

  @ApiProperty({ example: 1 })
  charge_type_id: number;

  @ApiProperty({ example: 'new' })
  charge_type: string;

  @ApiProperty({ example: 1 })
  Hospital_id: number;

  @ApiProperty({ example: 1 })
  hos_opd_id: number;

  @ApiProperty({ example: 1 })
  hospital_ipd_details_id: number;
}

export class CountDto {
  @ApiProperty({ example: '10' })
  details: IpdChargesDto[];

  @ApiProperty({ example: '10' })
  total: number;
}
