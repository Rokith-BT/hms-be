import { ApiProperty } from '@nestjs/swagger';
 
export class StaffAttendanceDto {

  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '2025-04-12' })
  date: Date;

  @ApiProperty({ example: 1 })
  staff_id: number;
 
  @ApiProperty({ example: 1 })
  staff_attendance_type_id: number;
 
  @ApiProperty({ example: 'none' })
  remark: string;

  @ApiProperty({ example: 1 })
  is_active: number;

  @ApiProperty({ example: '2025-04-12' })
  created_at: Date;

  @ApiProperty({ example: '2025-04-12' })
  updated_at: Date;

  @ApiProperty({ example: 1 })
  hospital_id: number;

  @ApiProperty({ example: 1 })
  hos_staff_attendance_id: number;
 
  @ApiProperty({ example: 1 })
  hos_staff_attendance_type_id: number;
 
}
 
export class CountDto {
    @ApiProperty({ example: '10' })
    details: StaffAttendanceDto[];
 
    @ApiProperty({ example: '10' })
    total: number;
 
}