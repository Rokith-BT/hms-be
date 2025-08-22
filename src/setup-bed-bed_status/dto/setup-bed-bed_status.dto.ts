import { ApiProperty } from '@nestjs/swagger';
 
export class BedStatusDto {

  @ApiProperty({ example: 'New bed' })
  name: string;

  @ApiProperty({ example: 'yes' })
  status: string;

  @ApiProperty({ example: 'new bed type' })
  bed_type: string  ;

  @ApiProperty({ example: 'new bed group' })
  bed_group: string;

  @ApiProperty({ example: 'first floor' })
  floor: string;
 
}
 
export class CountDto {
    @ApiProperty({ example: '10' })
    details: BedStatusDto[];
 
    @ApiProperty({ example: '10' })
    total: number;
 
}