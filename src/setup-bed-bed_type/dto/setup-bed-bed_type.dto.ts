import { ApiProperty } from '@nestjs/swagger';
 
export class BedTypeDto {

  @ApiProperty({ example: 'New bed type' })
  name: string;

  @ApiProperty({ example: '2025-04-02' })
  created_at: Date;
 
  @ApiProperty({ example: 1 })
  Hospital_id: number;
 
  @ApiProperty({ example: 1 })
  hospital_bed_type_id: number;
 
}
 
export class CountDto {
    @ApiProperty({ example: '10' })
    details: BedTypeDto[];
 
    @ApiProperty({ example: '10' })
    total: number;
 
}