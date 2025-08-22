import { ApiProperty } from '@nestjs/swagger';
 
export class FloorDto {
  @ApiProperty({ example: 'First floor' })
  name: string;
 
  @ApiProperty({ example: 'none' })
  description: string;
 
  @ApiProperty({ example: '2025-04-02' })
  created_at: Date;
 
  @ApiProperty({ example: 1 })
  Hospital_id: number;
 
  @ApiProperty({ example: 1 })
  hospital_floor_id: number;
 
}
 
export class CountDto {
    @ApiProperty({ example: '10' })
    details: FloorDto[];
 
    @ApiProperty({ example: '10' })
    total: number;
 
}