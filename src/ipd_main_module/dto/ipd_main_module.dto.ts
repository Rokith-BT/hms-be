import { ApiProperty } from '@nestjs/swagger';
 
export class IPDMainModuleDto {

  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  patient_id: number;

  @ApiProperty({ example: 1 })
  case_reference_id: number;
 
  @ApiProperty({ example: '160' })
  height: string;
 
  @ApiProperty({ example: '80' })
  weight: string;

  @ApiProperty({ example: '72' })
  pulse: string;

  @ApiProperty({ example: '96' })
  temperature: string;

  @ApiProperty({ example: '85' })
  respiration: string;
 
  @ApiProperty({ example: '96' })
  spo2: string;
 
  @ApiProperty({ example: '115' })
  bp: string;

  @ApiProperty({ example: 1 })
  bed: number;

  @ApiProperty({ example: 1 })
  bed_group_id: number;

  @ApiProperty({ example: 'new' })
  case_type: string;
 
  @ApiProperty({ example: 'no' })
  casualty: string;
 
  @ApiProperty({ example: 'fever' })
  symptoms: string;

  @ApiProperty({ example: 'sneezing' })
  known_allergies: string;

  @ApiProperty({ example: 'no' })
  patient_old: string;

  @ApiProperty({ example: 'none' })
  note: string;
 
  @ApiProperty({ example: 'none' })
  refference: string;
 
  @ApiProperty({ example: 1 })
  cons_doctor: number;

  @ApiProperty({ example: 1 })
  organisation_id: number;

  @ApiProperty({ example: 'none' })
  credit_limit: string;

  @ApiProperty({ example: 'cash' })
  payment_mode: string;
 
  @ApiProperty({ example: '2025-04-08' })
  date: Date;
 
  @ApiProperty({ example: 'no' })
  discharged: string;

  @ApiProperty({ example: 'no' })
  live_consult: string;

  @ApiProperty({ example: 1 })
  generated_by: number;

  @ApiProperty({ example: '2025-04-08' })
  created_at: Date;
 
  @ApiProperty({ example: 'none' })
  revert_reason: string;
 
  @ApiProperty({ example: '2025-04-08' })
  from_date: Date;

  @ApiProperty({ example: '2025-04-08' })
  to_date: Date;

  @ApiProperty({ example: 'yes' })
  is_active: string;

  @ApiProperty({ example: 1 })
  hospital_id: number;
 
  @ApiProperty({ example: 1 })
  hospital_ipd_details_id: number;
 
  @ApiProperty({ example: 1 })
  hospital_patient_bed_history_id: number;

  @ApiProperty({ example: 'no' })
  is_ipd_moved: number;
 
}
 
export class CountDto {
    @ApiProperty({ example: '10' })
    details: IPDMainModuleDto[];
 
    @ApiProperty({ example: '10' })
    total: number;
 
}