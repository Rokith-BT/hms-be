export class CreatePhpPayrollReportDto {
    month: string;
    year: string;
    roleId: number;
}

import { ApiProperty } from '@nestjs/swagger';

export class StaffPayslipDto {
  @ApiProperty({ example: 545 })
  staff_id: number;

  @ApiProperty({ example: 'IIT1545' })
  employee_id: string;

  @ApiProperty({ example: 'Venky' })
  name: string;

  @ApiProperty({ example: 'Super Admin' })
  user_type: string;

  @ApiProperty({ example: 'V' })
  surname: string;

  @ApiProperty({ example: 'spec123' })
  designation: string;

  @ApiProperty({ example: 'neurology' })
  department: string;

  @ApiProperty({ example: 5, description: 'Payslip ID' })
  id: number;

  @ApiProperty({ example: 30000 })
  basic: number;

  @ApiProperty({ example: 30000 })
  total_allowance: number;

  @ApiProperty({ example: 5400 })
  total_deduction: number;

  @ApiProperty({ example: 0 })
  leave_deduction: number;

  @ApiProperty({ example: 0 })
  tax: number;

  @ApiProperty({ example: 24600 })
  net_salary: number;

  @ApiProperty({ example: 'paid' })
  status: string;

  @ApiProperty({ example: 'april' })
  month: string;

  @ApiProperty({ example: '2025' })
  year: string;

  @ApiProperty({ example: null, nullable: true })
  cheque_no: string | null;

  @ApiProperty({ example: null, nullable: true })
  cheque_date: string | null;

  @ApiProperty({ example: null, nullable: true })
  attachment: string | null;

  @ApiProperty({ example: null, nullable: true })
  attachment_name: string | null;

  @ApiProperty({ example: 'Cash' })
  payment_mode: string;

  @ApiProperty({ example: '2025-05-02T18:30:00.000Z' })
  payment_date: string;

  @ApiProperty({ example: '' })
  remark: string;

  @ApiProperty({ example: 98 })
  generated_by: number;

  @ApiProperty({ example: '2025-04-01T11:30:35.000Z' })
  created_at: string;
}

export class PhpPayrollReportResponseDto {
    @ApiProperty({ type: [StaffPayslipDto] })
    details: StaffPayslipDto[];
    
    @ApiProperty({ example: 10 })
    count: number;
}