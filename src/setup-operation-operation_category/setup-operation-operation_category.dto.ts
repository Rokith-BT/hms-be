import { ApiProperty } from '@nestjs/swagger';

export class operation_category1{
     @ApiProperty({ example: 'second_category' })
  category: string;

  @ApiProperty({ example: 'no' })
  is_active: string;

  @ApiProperty({ example: 1 })
  Hospital_id: number;
}



export class CountDto {
  @ApiProperty({ example: '10' })
  details: operation_category1[];

  @ApiProperty({ example: '10' })
  total: number;

  @ApiProperty({ example: '10' })
  limit: number;



}