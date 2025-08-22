import { ApiProperty } from '@nestjs/swagger';

export class expense_head1 {
  @ApiProperty({ example: 'income' })
  income_category: string;


  @ApiProperty({ example: 'this is the income' })
  description: string;

  @ApiProperty({ example: 'yes' })
  is_active: string;

  @ApiProperty({ example: 'no' })
  is_deleted: string;


  @ApiProperty({ example: 1 })
  Hospital_id: number;





}

export class CountDto {
  @ApiProperty({ example: '10' })
  details: expense_head1[];

  @ApiProperty({ example: '10' })
  total: number;

}