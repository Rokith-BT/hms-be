import { ApiProperty } from '@nestjs/swagger';

export class opd_payment1 {



  @ApiProperty({ example: '4' })
  opd_id: number;

  @ApiProperty({ example: '2025-03-08 13:01:11' })
  payment_date: Date;

  @ApiProperty({ example: 'this is the opd payment' })
  note: string;

  @ApiProperty({ example: '410' })
  amount: string;

  @ApiProperty({ example: 'UPI' })
  payment_mode: string;

  @ApiProperty({ example: 'razorpay' })
  payment_gateway: any;

  @ApiProperty({ example: 'rzp_liveZsdSe' })
  payment_id: any;

  @ApiProperty({ example: '24456552' })
  payment_reference_number: any;

  @ApiProperty({ example: 1 })
  Hospital_id: number;


}

export class CountDto {
  @ApiProperty({ example: '10' })
  details: opd_payment1[];

  @ApiProperty({ example: '10' })
  total: number;

  @ApiProperty({ example: '10' })
  limit: number;

  @ApiProperty({ example: '10' })
  page: number;
}