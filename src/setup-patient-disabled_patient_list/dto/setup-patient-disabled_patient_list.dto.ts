import { ApiProperty } from '@nestjs/swagger';
 
export class DisabledPatientListDto {

  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  lang_id: number;

  @ApiProperty({ example: 'Aravind' })
  patient_name: string;

  @ApiProperty({ example: '2025-05-20' })
  dob: Date;

  @ApiProperty({ example: '25' })
  age: string;

  @ApiProperty({ example: '05' })
  month: string;

  @ApiProperty({ example: '05' })
  day: string;

  @ApiProperty({ example: 'new.jpg' })
  image: string;
 
  @ApiProperty({ example: '8989898989' })
  mobileno: string;
 
  @ApiProperty({ example: 'aravind@gmail.com' })
  email: string;

  @ApiProperty({ example: 'male' })
  gender: string;

  @ApiProperty({ example: 'single' })
  marital_status: string;

  @ApiProperty({ example: 'B+ve' })
  blood_group: string;

  @ApiProperty({ example: 1 })
  blood_bank_product_id: number;

  @ApiProperty({ example: 'Chennai' })
  address: string;

  @ApiProperty({ example: 'arun' })
  guardian_name: string;

  @ApiProperty({ example: 'new' })
  patient_type: string;

  @ApiProperty({ example: 748468547485 })
  identification_number: number;
 
  @ApiProperty({ example: 'none' })
  known_allergies: string;
 
  @ApiProperty({ example: 'none' })
  note: string;

  @ApiProperty({ example: 'yes' })
  is_ipd: string;

  @ApiProperty({ example: 'KYRYYR' })
  app_key: string;

  @ApiProperty({ example: 'INS001' })
  insurance_id: string;

  @ApiProperty({ example: '2025-05-20' })
  insurance_validity: Date;

  @ApiProperty({ example: 'no' })
  is_dead: string;

  @ApiProperty({ example: 'yes' })
  is_active: string;

  @ApiProperty({ example: 'no' })
  disable_at: string;

  @ApiProperty({ example: '2025-05-20' })
  created_at: Date;
 
  @ApiProperty({ example: '607302' })
  pincode: string;
 
  @ApiProperty({ example: '002' })
  state_code: string;

  @ApiProperty({ example: '29' })
  district_code: string;

  @ApiProperty({ example: '8585858585' })
  emergency_mobile_no: number;
 
}
 
export class CountDto {
    @ApiProperty({ example: '10' })
    details: DisabledPatientListDto[];
 
    @ApiProperty({ example: '10' })
    total: number;
 
}