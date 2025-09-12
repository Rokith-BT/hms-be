import { ApiProperty } from "@nestjs/swagger";

export class postOpdPrescriptionresp {
    @ApiProperty({
        description: 'Status of the response',
        example: 'success',
      })
      status: string;
    
      @ApiProperty({
        description: 'Message detailing the result of the operation',
        example: 'prescription added successfully',
      })
      message: string;
}



export class PrescriptionDetailDto {
    @ApiProperty({
      description: 'ID of the prescription',
      example: 2,
    })
    id: number;
  
    @ApiProperty({
      description: 'Name of the medicine',
      example: 'Paracetamol',
    })
    medicine_name: string;
  
    @ApiProperty({
      description: 'Frequency of dosage',
      example: '1-1-1-1',
    })
    frequency: string;
  
    @ApiProperty({
      description: 'Dosage of the medicine',
      example: '500mg',
    })
    dosage: string;
  
    @ApiProperty({
      description: 'Duration count for the medication',
      example: '5',
    })
    duration_count: string;
  
    @ApiProperty({
      description: 'Duration limit for the medication',
      example: 'days',
    })
    duration_limit: string;
  
    @ApiProperty({
      description: 'Quantity of medicine prescribed',
      example: '10',
    })
    quantity: string;
  
    @ApiProperty({
      description: 'When to take the medicine',
      example: 'before meal',
    })
    when: string;
  
    @ApiProperty({
      description: 'Remarks for the prescription',
      example: 'Take with water',
    })
    remarks: string;
  
    @ApiProperty({
      description: 'How the prescription was filled',
      example: 'voice',
    })
    filled_using: string;
  
    @ApiProperty({
      description: 'ID of the OPD associated with the prescription',
      example: 1,
    })
    opd_id: number;
  
    @ApiProperty({
      description: 'Creation date of the prescription',
      example: '2024-10-17T07:05:30.000Z',
    })
    created_at: string; 
  }

export class PrescriptionFetchResponseDto {
    @ApiProperty({
      description: 'Status of the response',
      example: 'success',
    })
    status: string;
  
    @ApiProperty({
      description: 'Message detailing the result of the operation',
      example: 'prescription fetch successfully',
    })
    message: string; 
  
    @ApiProperty({
      description: 'List of prescription details',
      type: [PrescriptionDetailDto],
    })
    details: PrescriptionDetailDto[];
  }