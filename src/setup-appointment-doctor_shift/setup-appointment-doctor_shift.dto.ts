import { ApiProperty } from '@nestjs/swagger';

export class appointment_doctor_shift1 {
  @ApiProperty({ example: '543' })
  staff_id: number;

  @ApiProperty({ example: '2' })
  global_shift_id: number;


  @ApiProperty({ example: 1 })
  Hospital_id: number;



}

export class CountDto {
  @ApiProperty({ example: '10' })
  details: appointment_doctor_shift1[];

  @ApiProperty({ example: '10' })
  total: number;

}