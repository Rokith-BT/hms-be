import { ApiProperty } from '@nestjs/swagger';
 
export class LeaveTypesDto {
  @ApiProperty({ example: 'Sick leave' })
  type: string;
 
  @ApiProperty({ example: 'yes' })
  is_active: string;
 
  @ApiProperty({ example: '2025-04-02' })
  created_at: Date;
 
  @ApiProperty({ example: 1 })
  Hospital_id: number;
 
  @ApiProperty({ example: 1 })
  hospital_leave_types_id: number;
 
}
 
export class CountDto {
    @ApiProperty({ example: '10' })
    details: LeaveTypesDto[];
 
    @ApiProperty({ example: '10' })
    total: number;
 
}