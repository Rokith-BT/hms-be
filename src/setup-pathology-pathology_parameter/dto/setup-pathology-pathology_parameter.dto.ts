import { ApiProperty } from '@nestjs/swagger';
 
export class PathologyParameterDto {

  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'patho parameter name' })
  parameter_name: string;

  @ApiProperty({ example: '10' })
  test_value: string;

  @ApiProperty({ example: '10' })
  reference_range: string;

  @ApiProperty({ example: 'Male' })
  gender: string;

  @ApiProperty({ example: 10 })
  unit: number;

  @ApiProperty({ example: 'none' })
  description: string;

  @ApiProperty({ example: '2025-05-08' })
  created_at: Date;
 
  @ApiProperty({ example: 1 })
  Hospital_id: number;
 
  @ApiProperty({ example: 1 })
  hospital_pathology_parameter_id: number;
 
}
 
export class CountDto {
    @ApiProperty({ example: '10' })
    details: PathologyParameterDto[];
 
    @ApiProperty({ example: '10' })
    total: number;
 
}