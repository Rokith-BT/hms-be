import { ApiProperty } from '@nestjs/swagger';

export class pharmacy_medicine_dosage1 {
  @ApiProperty({ example: '2' })
  medicine_category_id: number;

  @ApiProperty({ example: '10' })
  dosage: string;

  @ApiProperty({ example: '2' })
  charge_units_id: number;

  @ApiProperty({ example: 1 })
  Hospital_id: number;





}

export class CountDto {
  @ApiProperty({ example: '10' })
  details: pharmacy_medicine_dosage1[];

  @ApiProperty({ example: '10' })
  total: number;

}