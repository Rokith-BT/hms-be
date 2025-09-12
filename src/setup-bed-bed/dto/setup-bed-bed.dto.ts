import { ApiProperty } from '@nestjs/swagger';
 
export class BedDto {

  @ApiProperty({ example: 'New bed' })
  name: string;

  @ApiProperty({ example: 1 })
  bed_type_id: number;

  @ApiProperty({ example: 1 })
  bed_group_id: number;

  @ApiProperty({ example: 'yes' })
  is_active: string;

  @ApiProperty({ example: '2025-04-02' })
  created_at: Date;
 
  @ApiProperty({ example: 1 })
  Hospital_id: number;
 
  @ApiProperty({ example: 1 })
  hospital_bed_id: number;
 
}
 
export class CountDto {
    @ApiProperty({ example: '10' })
    details: BedDto[];
 
    @ApiProperty({ example: '10' })
    total: number;
 
}