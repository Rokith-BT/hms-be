import { ApiProperty } from '@nestjs/swagger';

export class appointment_shift1 {
  @ApiProperty({ example: 'Dr. developer N' })
  name: string;

  @ApiProperty({ example: '16:05:00' })
  start_time: TimeRanges;

  @ApiProperty({ example: '20:05:00' })
  end_time: TimeRanges;

  @ApiProperty({ example: 1 })
  Hospital_id: number;



}

export class CountDto {
  @ApiProperty({ example: '10' })
  details: appointment_shift1[];

  @ApiProperty({ example: '10' })
  total: number;

}