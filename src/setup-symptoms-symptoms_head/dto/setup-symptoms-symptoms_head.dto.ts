import { ApiProperty } from '@nestjs/swagger';
 
export class SymptomsHeadDto {

  @ApiProperty({ example: 'Viral fever' })
  symptoms_title: string;

  @ApiProperty({ example: 'none' })
  description: string;

  @ApiProperty({ example: 'Fever' })
  type: string;
 
  @ApiProperty({ example: 1 })
  Hospital_id: number;
 
  @ApiProperty({ example: 1 })
  hospital_symptoms_id: number;
 
}
 
export class CountDto {
    @ApiProperty({ example: '10' })
    details: SymptomsHeadDto[];
 
    @ApiProperty({ example: '10' })
    total: number;
 
}