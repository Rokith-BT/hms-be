import { ApiProperty } from '@nestjs/swagger';
 
export class DepartmentDto {
  @ApiProperty({ example: 'Neurology' })
  department_name: string;
 
  @ApiProperty({ example: 'yes' })
  is_active: string;
 
  @ApiProperty({ example: '2025-04-02' })
  created_at: Date;
 
  @ApiProperty({ example: 1 })
  Hospital_id: number;
 
  @ApiProperty({ example: 1 })
  hospital_department_id: number;
 
}
 
export class CountDto {
    @ApiProperty({ example: '10' })
    details: DepartmentDto[];
 
    @ApiProperty({ example: '10' })
    total: number;
 
}