import { ApiProperty } from '@nestjs/swagger';

export class FinanceIncomeDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  inc_head_id: number;

  @ApiProperty({ example: 'income1' })
  name: string;

  @ApiProperty({ example: 'INC001' })
  invoice_no: string;

  @ApiProperty({ example: '2025-04-29' })
  date: Date;

  @ApiProperty({ example: '100.00' })
  amount: any;

  @ApiProperty({ example: 'new' })
  note: string;

  @ApiProperty({ example: 'no' })
  is_deleted: string;

  @ApiProperty({ example: 'new.pdf' })
  documents: string;

  @ApiProperty({ example: 1 })
  generated_by: number;

  @ApiProperty({ example: 'yes' })
  is_active: string;

  @ApiProperty({ example: '2025-04-29' })
  created_at: Date;

  @ApiProperty({ example: 1 })
  hos_income_id: number;

  @ApiProperty({ example: 1 })
  hospital_id: number;

}

export class CountDto {
  @ApiProperty({ example: '10' })
  details: FinanceIncomeDto[];

  @ApiProperty({ example: '10' })
  total: number;

  @ApiProperty({ example: '1' })
  page: number;

  @ApiProperty({ example: '1' })
  limit: number;
}
