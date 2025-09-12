import { ApiProperty } from "@nestjs/swagger";
import { ClinicalNotesResponseDto } from "src/op-hub-clinical-notes-with-abha/entities/op-hub-clinical-notes-with-abha.entity";
import { UpdateManualVitalDto } from "src/op-hub-manual-vitals/dto/update-manual_vital.dto";
import { PrescriptionDetailDto } from "src/op-hub-opd-prescription/entities/op-hub-opd-prescription.entity";

export class PatientDetailsDto {
  
  @ApiProperty({
    description: 'Name of the patient',
    example: 'Test',
  })
  patientName: string;

  @ApiProperty({
    description: 'Date of birth of the patient in YYYY-MM-DD format',
    example: '2016-10-18',
  })
  dob: string;

  @ApiProperty({
    description: 'Age of the patient',
    example: '8',
  })
  age: string;

  @ApiProperty({
    description: 'Mobile number of the patient',
    example: '7092327667',
  })
  mobileno: string;

  @ApiProperty({
    description: 'Email address of the patient',
    example: '',
    required: false,
  })
  email: string;

  @ApiProperty({
    description: 'Gender of the patient',
    example: 'Male',
  })
  gender: string;

  @ApiProperty({
    description: 'Address of the patient',
    example: 'Chennai',
  })
  address: string;

  @ApiProperty({
    description: 'Blood group of the patient',
    example: '-',
    required: false,
  })
  patient_blood_group: string;
}

class DoctorDetailsDto {
    @ApiProperty({ example: 'Matheshwari N' })
    doctorName: string;
  
    @ApiProperty({ example: '1122112' })
    employee_id: string;
  
    @ApiProperty({ example: 'Male' })
    gender: string;
  }
export class PreviewDoc {
    
  
    @ApiProperty({ type: DoctorDetailsDto })
    doctor_details: DoctorDetailsDto;
  
    @ApiProperty({ type: ClinicalNotesResponseDto })
    clinical_notes: ClinicalNotesResponseDto;
  
    @ApiProperty({ type: [PrescriptionDetailDto] })
    prescription: PrescriptionDetailDto[];
  
    @ApiProperty({ type: UpdateManualVitalDto })
    vitals: UpdateManualVitalDto;
}
