import { ApiProperty } from '@nestjs/swagger';
 
export class IpdBedStatusDto {

  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'New Bed' })
  name: string;

  @ApiProperty({ example: '2025-04-18' })
  from_date: Date;
 
  @ApiProperty({ example: '2025-04-18' })
  to_date: Date;

  @ApiProperty({ example: 'yes' })
  is_active: string;

  @ApiProperty({ example: 1 })
  case_reference_id: number;

}
 
export class CountDto {

    @ApiProperty({ example: '10' })
    details: IpdBedStatusDto[];
 
    @ApiProperty({ example: '10' })
    total: number;
 
}