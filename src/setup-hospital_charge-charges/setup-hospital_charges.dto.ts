import { ApiProperty } from '@nestjs/swagger';

export class charges1 {

    @ApiProperty({ example: '1' })
  charge_category_id: number;

  @ApiProperty({ example: '1' })
  tax_category_id: number;

  @ApiProperty({ example: '1' })
  charge_unit_id: number;

  @ApiProperty({ example: 'first_find' })
  name: string;

  @ApiProperty({ example: '1' })
  standard_charge: number;

  @ApiProperty({ example: '2025-04-03' })
  date: number;

  @ApiProperty({ example: 'this is the range' })
  description: string;

  @ApiProperty({ example: 'good' })
  status: number;

  @ApiProperty({ example: 1 })
  Hospital_id: number;



}

export class CountDto {
  @ApiProperty({ example: '10' })
  details: charges1[];

  @ApiProperty({ example: '10' })
  total: number;

}