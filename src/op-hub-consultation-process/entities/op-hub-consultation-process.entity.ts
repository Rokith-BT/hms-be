import { ApiProperty } from '@nestjs/swagger';

export class Consultation {
  @ApiProperty({ example: 123, description: 'The ID of the patient' })
  patient_id: number;

  @ApiProperty({ example: 'APPN1234', description: 'The ID of the appointment' })
  appointment_id: any;

  @ApiProperty({ example: 5, description: 'The ID of the consultation process color code' })
  consultation_process_color_code_id: number;

  @ApiProperty({ example: 10, description: 'The ID of the consultation process list' })
  consultaiton_process_list_id: number;

  @ApiProperty({ example: 3, description: 'The ID of the staff involved in the consultation' })
  staff_id: number;

  @ApiProperty({ example: 'The patient is experiencing mild symptoms.', description: 'Description of the consultation process' })
  description: string;

  @ApiProperty({ example: 1, description: 'The ID of the hospital' })
  hospital_id: number;
}
