import { ApiProperty } from '@nestjs/swagger';

export class pharmacy_medicine_category1 {
  @ApiProperty({ example: 'capsule' })
  medicine_category: string;

  @ApiProperty({ example: 1 })
  Hospital_id: number;





}

export class CountDto {
  @ApiProperty({ example: '10' })
  details: pharmacy_medicine_category1[];

  @ApiProperty({ example: '10' })
  total: number;

}