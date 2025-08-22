import { ApiProperty } from '@nestjs/swagger';

export class unittype1 {
  @ApiProperty({ example: 'one unit' })
  unit: string;

  @ApiProperty({ example: 1 })
  Hospital_id: number;





}

export class CountDto {
  @ApiProperty({ example: '10' })
  details: unittype1[];

  @ApiProperty({ example: '10' })
  total: number;

}