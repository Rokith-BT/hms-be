import { ApiProperty } from '@nestjs/swagger';
 
export class RadiologyUnitDto {

  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'radio unit' })
  unit_name: string;

  @ApiProperty({ example: 'radio' })
  unit_type: string;


  @ApiProperty({ example: '2025-05-07' })
  created_at: Date;
 
  @ApiProperty({ example: 1 })
  Hospital_id: number;
 
  @ApiProperty({ example: 1 })
  hospital_unit_id: number;
 
}
 
export class CountDto {
    @ApiProperty({ example: '10' })
    details: RadiologyUnitDto[];
 
    @ApiProperty({ example: '10' })
    total: number;
 
}