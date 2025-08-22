import { ApiProperty } from '@nestjs/swagger';
 
export class BedGroupDto {
  @ApiProperty({ example: 'New bed group' })
  name: string;
 
  @ApiProperty({ example: 'blue' })
  color: string;

  @ApiProperty({ example: 'none' })
  description: string;

  @ApiProperty({ example: 1 })
  floor: number;

  @ApiProperty({ example: 'yes' })
  is_active: string;
 
  @ApiProperty({ example: '2025-04-02' })
  created_at: Date;
 
  @ApiProperty({ example: 1 })
  Hospital_id: number;
 
  @ApiProperty({ example: 1 })
  hospital_bed_group_id: number;
 
}
 
export class CountDto {
    @ApiProperty({ example: '10' })
    details: BedGroupDto[];
 
    @ApiProperty({ example: '10' })
    total: number;

}