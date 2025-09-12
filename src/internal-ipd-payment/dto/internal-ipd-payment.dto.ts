import { ApiProperty } from '@nestjs/swagger';

export class IpdPaymentDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '2025-04-17' })
  payment_date: Date;

  @ApiProperty({ example: 'paid' })
  note: string;

  @ApiProperty({ example: 'cash' })
  payment_mode: string;

  @ApiProperty({ example: '100.00' })
  amount: any;

  @ApiProperty({ example: 1 })
  ipd_id: number;

  @ApiProperty({ example: 1 })
  patient_id: number;

  @ApiProperty({ example: 1 })
  received_by: number;

  @ApiProperty({ example: 1 })
  Hospital_id: number;

  @ApiProperty({ example: 1 })
  hos_transaction_id: number;

  @ApiProperty({ example: 'razorpay' })
  payment_gateway: any;

  @ApiProperty({ example: 'raz11llkkg' })
  payment_reference_number: any;

  @ApiProperty({ example: '1' })
  payment_id: any;

  @ApiProperty({ example: 'Anbu' })
  received_by_name: string;

}

export class CountDto {
  @ApiProperty({ example: '10' })
  details: IpdPaymentDto[];

  @ApiProperty({ example: '10' })
  total: number;
}
