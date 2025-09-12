import { ApiProperty } from '@nestjs/swagger';

export class charge_type_master1 {
 
    @ApiProperty({ example: 'charge Type 11' })
    charge_type: string;

    @ApiProperty({example: "yes"})
    is_default: string;

    @ApiProperty({ example: 'yes' })
    is_active: string;

 

    @ApiProperty({ example: 1 })
    Hospital_id: number;

  



}

export class CountDto {
  @ApiProperty({ example: '10' })
  details: charge_type_master1[];

  @ApiProperty({ example: '10' })
  total: number;

}