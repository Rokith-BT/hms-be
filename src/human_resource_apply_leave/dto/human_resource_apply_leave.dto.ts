import { ApiProperty } from '@nestjs/swagger';

export class StaffApplyLeaveDto {

  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  staff_id: number;

  @ApiProperty({ example: 1 })
  leave_type_id: number;

  @ApiProperty({ example: '2025-04-16' })
  leave_from: Date;

  @ApiProperty({ example: '2025-04-16' })
  leave_to: Date;

  @ApiProperty({ example: 1 })
  leave_days: number;

  @ApiProperty({ example: 'none' })
  employee_remark: string;

  @ApiProperty({ example: 'none' })
  admin_remark: string;

  @ApiProperty({ example: 'approved' })
  status: string;

  @ApiProperty({ example: 1 })
  applied_by: number;

  @ApiProperty({ example: 1 })
  status_updated_by: number;

  @ApiProperty({ example: 'new.pdf' })
  document_file: any;

  @ApiProperty({ example: '2025-04-16' })
  date: Date;

  @ApiProperty({ example: '2025-04-16' })
  created_at: Date;

  @ApiProperty({ example: '10' })
  alloted_leave: string;

  @ApiProperty({ example: 1 })
  hospital_id: number;

  @ApiProperty({ example: 1 })
  hos_staff_leave_request_id: number;

  @ApiProperty({ example: 1 })
  hos_staff_leave_details_id: number;
}

export class CountDto {

  @ApiProperty({ example: '10' })
  details: StaffApplyLeaveDto[];

  @ApiProperty({ example: '10' })
  total: number;

}
