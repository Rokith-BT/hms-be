import { ApiProperty } from '@nestjs/swagger';

export class findings_category1 {
  @ApiProperty({ example: 'first_category' })
  category: string;


  @ApiProperty({ example: 1 })
  Hospital_id: number;



}

export class CountDto {
  @ApiProperty({ example: '10' })
  details: findings_category1[];

  @ApiProperty({ example: '10' })
  total: number;

  @ApiProperty({ example: '10'})
  limit:number;

}