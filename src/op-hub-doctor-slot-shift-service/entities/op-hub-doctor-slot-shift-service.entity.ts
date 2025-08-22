import { ApiProperty } from '@nestjs/swagger';

export class DoctorSlotShift {
  @ApiProperty({ description: 'Unique identifier for the shift', example: 1 })
  shift_id: number;

  @ApiProperty({ description: 'Unique identifier for the staff member', example: 101 })
  staff_id: number;

  @ApiProperty({ description: 'Date of the shift', type: String, example: '2024-07-12' })
  date: any;  

  @ApiProperty({ description: 'Unique identifier for the hospital', example: 5 })
  hospital_id: number;
}
