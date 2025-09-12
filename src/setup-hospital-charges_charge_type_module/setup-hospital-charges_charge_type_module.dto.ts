import { ApiProperty } from '@nestjs/swagger';

export class charge_type_module1 {
 
    @ApiProperty({ example: '1' })
    charge_type_master_id: string;

    @ApiProperty({example: "opd"})
    module_shortcode: string; 

    @ApiProperty({ example: 1 })
    Hospital_id: number;

  



}

export class CountDto {
  @ApiProperty({ example: '10' })
  details: charge_type_module1[];

  @ApiProperty({ example: '10' })
  total: number;

}