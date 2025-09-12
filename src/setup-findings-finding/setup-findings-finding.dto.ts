import { ApiProperty } from '@nestjs/swagger';

export class finding1 {
  @ApiProperty({ example: 'first_find' })
  name: string;

  @ApiProperty({ example: 'this is the range' })
  description: string;

  @ApiProperty({ example: '1' })
  finding_category_id: number;

  @ApiProperty({ example: 1 })
  Hospital_id: number;



}

export class CountDto {
  @ApiProperty({ example: '10' })
  details: finding1[];

  @ApiProperty({ example: '10' })
  total: number;

  @ApiProperty({example:'10'})
  limit:number;
}