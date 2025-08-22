import { ApiProperty } from '@nestjs/swagger';

export class opd_charges1 {

  @ApiProperty({ example: '2000-03-22' })
  dob: any;

  @ApiProperty({ example: '4' })
  opd_id: number;

  @ApiProperty({ example: '1' })
  qty: number;

  @ApiProperty({ example: '1' })
  charge_id: number;

  @ApiProperty({ example: '200' })
  standard_charge: string;

  @ApiProperty({ example: '0.0' })
  tpa_charge: string;

  @ApiProperty({ example: '10' })
  tax: string;

  @ApiProperty({ example: '103' })
  apply_charge: string;

  @ApiProperty({ example: '410' })
  amount: string;

  @ApiProperty({ example: 'this is the opd charges' })
  note: string;

  @ApiProperty({ example: 1 })
  Hospital_id: number;


}

export class CountDto {
  @ApiProperty({ example: '10' })
  details: opd_charges1[];

  @ApiProperty({ example: '10' })
  total: number;

  @ApiProperty({ example: '10' })
  limit: number;

  @ApiProperty({ example: '10' })
  page: number;
}