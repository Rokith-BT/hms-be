import { ApiProperty } from '@nestjs/swagger';
 
export class RadiologyCategoryDto {

  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'radio category' })
  lab_name: string;

  @ApiProperty({ example: '2025-05-08' })
  created_at: Date;
 
  @ApiProperty({ example: 1 })
  Hospital_id: number;
 
  @ApiProperty({ example: 1 })
  hospital_lab_id: number;
 
}
 
export class CountDto {
    @ApiProperty({ example: '10' })
    details: RadiologyCategoryDto[];
 
    @ApiProperty({ example: '10' })
    total: number;
 
}