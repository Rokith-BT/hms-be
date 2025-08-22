import { ApiProperty } from '@nestjs/swagger';

export class tax_category1 {
  @ApiProperty({ example: 'service tax' })
  name: string;

  @ApiProperty({ example: '10' })
  percentage: string;

 
  @ApiProperty({ example: 1 })
  Hospital_id: number;





}

export class CountDto {
  @ApiProperty({ example: '10' })
  details: tax_category1[];

  @ApiProperty({ example: '10' })
  total: number;

}