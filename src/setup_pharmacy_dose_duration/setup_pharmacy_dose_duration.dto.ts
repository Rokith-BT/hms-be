import { ApiProperty } from '@nestjs/swagger';

export class pharmacy_dose_duration1 {
  @ApiProperty({ example: '1 dose' })
  name: string;

  @ApiProperty({ example: 1 })
  Hospital_id: number;





}

export class CountDto {
  @ApiProperty({ example: '10' })
  details: pharmacy_dose_duration1[];

  @ApiProperty({ example: '10' })
  total: number;

}