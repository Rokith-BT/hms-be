import { ApiProperty } from "@nestjs/swagger";

export class Vital {
    @ApiProperty({
        description: 'Unique identifier for the hospital',
        example: 123,
      })
      Hospital_id: number;
    
      @ApiProperty({
        description: 'Unique identifier for the patient',
        example: 456,
      })
      patient_id: number;
    
      @ApiProperty({
        description: 'Name of the medical record',
        example: 'Blood Test Results',
      })
      record_name: string;
    
      @ApiProperty({
        description: 'Unique identifier for the appointment',
        example: 'APPN789',
      })
      appointment_id: string;
    
      @ApiProperty({
        description: 'File path or URL to the prescription document',
        example: 'https://example.com/prescriptions/123.pdf',
      })
      files: string;
}
