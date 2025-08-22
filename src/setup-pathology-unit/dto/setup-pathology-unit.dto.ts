import { ApiProperty } from '@nestjs/swagger';
 
export class PathologyUnitDto {

  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'patho unit' })
  unit_name: string;

  @ApiProperty({ example: 'patho' })
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
    details: PathologyUnitDto[];
 
    @ApiProperty({ example: '10' })
    total: number;
 
}