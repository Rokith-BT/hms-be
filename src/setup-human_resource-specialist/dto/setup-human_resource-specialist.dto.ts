import { ApiProperty } from '@nestjs/swagger';
 
export class SpecialistDto {
  @ApiProperty({ example: 'Surgeon' })
  specialist_name: string;
 
  @ApiProperty({ example: 'yes' })
  is_active: string;
 
  @ApiProperty({ example: '2025-04-02' })
  created_at: Date;
 
  @ApiProperty({ example: 1 })
  Hospital_id: number;
 
  @ApiProperty({ example: 1 })
  hospital_specialist_id: number;
 
}
 
export class CountDto {
    @ApiProperty({ example: '10' })
    details: SpecialistDto[];
 
    @ApiProperty({ example: '10' })
    total: number;
 
}