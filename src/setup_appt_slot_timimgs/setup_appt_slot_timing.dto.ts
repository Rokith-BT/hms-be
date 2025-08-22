import { ApiProperty } from '@nestjs/swagger';

export class appt_slot_timingDto {
  @ApiProperty({ example: 'thursday' })
  day: string;

  @ApiProperty({ example: '10' })
  staff_id: number;

  @ApiProperty({ example: '2' })
  global_shift_id: number;

  @ApiProperty({ example: '13:00:00' })
  start_time: Date;

  @ApiProperty({ example: '14:00:00' })
  end_time: Date;
 
  @ApiProperty({ example: 1 })
  Hospital_id: number;





}

export class CountDto {
  @ApiProperty({ example: '10' })
  details: appt_slot_timingDto[];

  @ApiProperty({ example: '10' })
  total: number;

}