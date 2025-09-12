import { ApiProperty } from '@nestjs/swagger';

export class new_patient1 {
  @ApiProperty({ example: '4' })
  lang_id: number;

  @ApiProperty({ example: 'arun' })
  patient_name: string;

  @ApiProperty({ example: '2000-03-22' })
  dob: any;

  @ApiProperty({ example: '8768959090' })
  mobileno: number;

  @ApiProperty({ example: 'arun33@gmail.com' })
  email: number;

  @ApiProperty({ example: 'male' })
  gender: string;

  @ApiProperty({ example: 'single' })
  marital_status: string;

  @ApiProperty({ example: '2' })
  blood_bank_product_id: number;

  @ApiProperty({ example: 'chennai' })
  address: string;

  @ApiProperty({ example: 'deva' })
  guardian_name: string;

  @ApiProperty({ example: 'sdfbsbfbvdjbv' })
  ABHA_number: string;

  @ApiProperty({ example: 'no' })
  known_allergies: string;

  @ApiProperty({ example: 'this is the new patient' })
  note: string;

  @ApiProperty({ example: 'dfgdfgrtgtrbrtsr' })
  insurance_id: string;

  @ApiProperty({ example: '2027-04-04 16:05:00' })
  insurance_validity: string;

  @ApiProperty({ example: 'MR' })
  salutation: string;

  @ApiProperty({ example: 1 })
  hospital_id: number;

  @ApiProperty({ example: 'true' })
  is_confirmed_to_create_new_patient: boolean;
}

export class CountDto {
  @ApiProperty({ example: '10' })
  details: new_patient1[];

  @ApiProperty({ example: '10' })
  total: number;

  @ApiProperty({ example: '10' })
  limit: number;



}


export class PatientInfoDto {
  @ApiProperty()
  patient_info: any;

  @ApiProperty()
  opd_details: any;

  @ApiProperty()
  ipd_details: any;
}
