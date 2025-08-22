import { ApiProperty } from '@nestjs/swagger';

export class StaffPayrollDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  staff_id: number;

  @ApiProperty({ example: '30000.00' })
  basic: any;

  @ApiProperty({ example: '1000.00' })
  total_allowance: any;

  @ApiProperty({ example: '1000.00' })
  total_deduction: any;

  @ApiProperty({ example: 1000 })
  leave_deduction: number;

  @ApiProperty({ example: '100.00' })
  tax: any;

  @ApiProperty({ example: '30000.00' })
  net_salary: any;

  @ApiProperty({ example: 'generated' })
  status: string;

  @ApiProperty({ example: 'March' })
  month: string;

  @ApiProperty({ example: '2025' })
  year: string;

  @ApiProperty({ example: 'CH0001' })
  cheque_no: string;

  @ApiProperty({ example: '2025-04-15' })
  cheque_date: Date;

  @ApiProperty({ example: 'new.pdf' })
  attachment: string;

  @ApiProperty({ example: 'new' })
  attachment_name: string;

  @ApiProperty({ example: 'cash' })
  payment_mode: string;

  @ApiProperty({ example: '2025-04-15' })
  payment_date: Date;

  @ApiProperty({ example: 'paid' })
  remark: string;

  @ApiProperty({ example: 1 })
  generated_by: number;

  @ApiProperty({ example: '2025-04-15' })
  created_at: Date;

  @ApiProperty({ example: 1 })
  hospital_id: number;

  @ApiProperty({ example: 1 })
  hos_staff_payslip_id: number;

  @ApiProperty({ example: 1 })
  staff_payslip_id: number;

  @ApiProperty({ example: 'positive' })
  allowance_type: string;

  @ApiProperty({ example: '1000.00' })
  amount: any;

  @ApiProperty({ example: 'incoming' })
  cal_type: string;

  @ApiProperty({ example: 1 })
  hos_payslip_allowance_id: number;

  @ApiProperty({ example: '1000.00' })
  staff_payslip_allowance: any;
}

export class CountDto {
  @ApiProperty({ example: '10' })
  details: StaffPayrollDto[];

  @ApiProperty({ example: '10' })
  total: number;
}
