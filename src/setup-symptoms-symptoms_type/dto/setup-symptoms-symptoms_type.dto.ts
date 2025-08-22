import { ApiProperty } from '@nestjs/swagger';
 
export class SymptomsTypeDto {

  @ApiProperty({ example: 'Fever' })
  symptoms_type: string;
 
  @ApiProperty({ example: 1 })
  Hospital_id: number;
 
  @ApiProperty({ example: 1 })
  hospital_symptoms_id: number;
 
}
 
export class CountDto {
    @ApiProperty({ example: '10' })
    details: SymptomsTypeDto[];
 
    @ApiProperty({ example: '10' })
    total: number;
 
}