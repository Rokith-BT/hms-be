import { ApiProperty } from '@nestjs/swagger';
 
export class StaffDto {

  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'PLE0001' })
  employee_id: string;

  @ApiProperty({ example: 1 })
  lang_id: number;
 
  @ApiProperty({ example: 1 })
  department_id: number;
 
  @ApiProperty({ example: 1 })
  staff_designation_id: number;

  @ApiProperty({ example: 'Oncology' })
  specialist: string;

  @ApiProperty({ example: 'MBBS' })
  qualification: string;

  @ApiProperty({ example: '10' })
  work_exp: string;
 
  @ApiProperty({ example: 'Oncology' })
  specialization: string;
 
  @ApiProperty({ example: 'Raja' })
  name: string;

  @ApiProperty({ example: 'R' })
  surname: string;

  @ApiProperty({ example: 'Father' })
  father_name: string;

  @ApiProperty({ example: 'Mother' })
  mother_name: string;
 
  @ApiProperty({ example: '9877898527' })
  contact_no: string;
 
  @ApiProperty({ example: '9856231452' })
  emergency_contact_no: string;

  @ApiProperty({ example: 'raja@gmail.com' })
  email: string;

  @ApiProperty({ example: '2001-03-09 18:30:00.00' })
  dob: Date;

  @ApiProperty({ example: 'married' })
  marital_status: string;
 
  @ApiProperty({ example: '2025-03-09 18:30:00.00' })
  date_of_joining: Date;
 
  @ApiProperty({ example: '2030-03-09 18:30:00.00' })
  date_of_leaving: Date;

  @ApiProperty({ example: 'chennai' })
  local_address: string;

  @ApiProperty({ example: 'chennai' })
  permanent_address: string;

  @ApiProperty({ example: 'none' })
  note: string;
 
  @ApiProperty({ example: 'new.img' })
  image: string;
 
  @ApiProperty({ example: 'Raja@1234' })
  password: string;

  @ApiProperty({ example: 'male' })
  gender: string;

  @ApiProperty({ example: 1 })
  blood_group: number;

  @ApiProperty({ example: 'SBI' })
  account_title: string;
 
  @ApiProperty({ example: '789456123655588' })
  bank_account_no: string;
 
  @ApiProperty({ example: 'SBI' })
  bank_name: string;

  @ApiProperty({ example: 'SBI000245' })
  ifsc_code: string;

  @ApiProperty({ example: 'Guindy' })
  bank_branch: string;

  @ApiProperty({ example: 'new' })
  payscale: string;
 
  @ApiProperty({ example: '10000' })
  basic_salary: string;
 
  @ApiProperty({ example: 'EPF001' })
  epf_no: string;

  @ApiProperty({ example: 'Permanent' })
  contract_type: string;

  @ApiProperty({ example: 'new' })
  shift: string;

  @ApiProperty({ example: 'chennai' })
  location: string;
 
  @ApiProperty({ example: 'facebook' })
  facebook: string;
 
  @ApiProperty({ example: 'twitter' })
  twitter: string;

  @ApiProperty({ example: 'linkedIn' })
  linkedin: string;

  @ApiProperty({ example: 'Instagram' })
  instagram: string;

  @ApiProperty({ example: 'new' })
  resume: string;
 
  @ApiProperty({ example: 'new' })
  joining_letter: string;
 
  @ApiProperty({ example: 'reg' })
  resignation_letter: string;

  @ApiProperty({ example: 'doc' })
  other_document_name: string;

  @ApiProperty({ example: 'docs' })
  other_document_file: string;

  @ApiProperty({ example: 1 })
  user_id: number;
 
  @ApiProperty({ example: 1 })
  is_active: number;
 
  @ApiProperty({ example: 1 })
  verification_code: number;

  @ApiProperty({ example: 'Z0011' })
  zoom_api_key: string;

  @ApiProperty({ example: 'ZZZ111' })
  zoom_api_secret: string;

  @ApiProperty({ example: 'BLP00147' })
  pan_number: string;
 
  @ApiProperty({ example: 1 })
  identification_number: number;
 
  @ApiProperty({ example: 1 })
  local_identification_number: number;

  @ApiProperty({ example: '2025-04-03 11:11:11' })
  created_at: Date;

  @ApiProperty({ example: 1 })
  hospital_id: number;

  @ApiProperty({ example: 1 })
  staff_id: number;
 
  @ApiProperty({ example: 'none' })
  Health_Professional_Registry: string;
 
  @ApiProperty({ example: 'Tamil' })
  languagesKnown: string;

  @ApiProperty({ example: 3 })
  role_id: number;

  @ApiProperty({ example: 1 })
  hos_staff_role_id: number;

  @ApiProperty({ example: 'new.pdf' })
  certificates: any;
 
  @ApiProperty({ example: 1 })
  leave_type_id: number;
 
  @ApiProperty({ example: '10' })
  alloted_leave: string;

  @ApiProperty({ example: 1 })
  hos_staff_leave_details_id: number;
 
  @ApiProperty({ example: 'none' })
  leave_types: any;

 
}
 
export class CountDto {
    @ApiProperty({ example: '10' })
    details: StaffDto[];
 
    @ApiProperty({ example: '10' })
    total: number;
 
}