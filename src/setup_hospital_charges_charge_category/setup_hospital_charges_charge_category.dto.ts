import { ApiProperty } from '@nestjs/swagger';

export class charge_category1 {
  @ApiProperty({ example: 'first_charge' })
  name: string;

  @ApiProperty({ example: 'this is the range' })
  description: string;

  @ApiProperty({ example: '2' })
  charge_type_id: number;

  @ApiProperty({ example: 1 })
  Hospital_id: number;

  @ApiProperty({example: "yes"})
  is_default: string;



}

export class CountDto {
  @ApiProperty({ example: '10' })
  details: charge_category1[];

  @ApiProperty({ example: '10' })
  total: number;

  @ApiProperty({ example: '10' })
  limit: number;

  @ApiProperty({ example: '10' })
  page: number;

}