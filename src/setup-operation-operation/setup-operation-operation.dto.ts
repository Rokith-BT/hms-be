import { ApiProperty } from '@nestjs/swagger';

export class operation1 {
  @ApiProperty({ example: 'first operation' })
  operation: string;

  @ApiProperty({ example: 'yes' })
  is_active: string;

  @ApiProperty({ example: '1' })
  category_id: number;

  @ApiProperty({ example: 1 })
  Hospital_id: number;



}


export class CountDto {
  @ApiProperty({ example: '10' })
  details: operation1[];

  @ApiProperty({ example: '10' })
  total: number;

}