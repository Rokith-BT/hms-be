import { ApiProperty } from '@nestjs/swagger';
 
export class IPDPatientDischargeModuleDto {

  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  case_reference_id: number;

  @ApiProperty({ example: 1 })
  opd_details_id: number;
 
  @ApiProperty({ example: 1 })
  ipd_details_id: number;
 
  @ApiProperty({ example: 1 })
  discharge_by: number;

  @ApiProperty({ example: '2025-04-09' })
  discharge_date: Date;

  @ApiProperty({ example: 1 })
  discharge_status: number;

  @ApiProperty({ example: '2025-04-09' })
  death_date: Date;
 
  @ApiProperty({ example: '2025-04-09' })
  refer_date: Date;
 
  @ApiProperty({ example: 'hospital' })
  refer_to_hospital: string;

  @ApiProperty({ example: 'higher treatment' })
  reason_for_referral: string;

  @ApiProperty({ example: 'none' })
  operation: string;

  @ApiProperty({ example: 'new' })
  diagnosis: string;
 
  @ApiProperty({ example: 'none' })
  investigations: string;
 
  @ApiProperty({ example: 'none' })
  treatment_home: string;

  @ApiProperty({ example: 'none' })
  note: string;

  @ApiProperty({ example: '2025-04-09' })
  to_date: Date;

  @ApiProperty({ example: 'yes' })
  is_active: string;
 
  @ApiProperty({ example: 'no' })
  discharged: string;
 
  @ApiProperty({ example: 1 })
  patient_id: number;

  @ApiProperty({ example: 'new.pdf' })
  attachment: string;

  @ApiProperty({ example: 'none' })
  attachment_name: string;

  @ApiProperty({ example: 'Ram' })
  guardian_name: string;
 
  @ApiProperty({ example: 'report.pdf' })
  death_report: string;
 
  @ApiProperty({ example: 1 })
  Hospital_id: number;

  @ApiProperty({ example: 1 })
  hospital_discharge_card_id: number;

  @ApiProperty({ example: 1 })
  hospital_death_report_id: number;

  @ApiProperty({ example: 1 })
  hospital_patient_bed_history_id: number;
 
  @ApiProperty({ example: 1 })
  hospital_ipd_details_id: number;
 
  @ApiProperty({ example: 1 })
  hospital_bed_id: number;
 
}
 
export class CountDto {
    @ApiProperty({ example: '10' })
    details: IPDPatientDischargeModuleDto[];
 
    @ApiProperty({ example: '10' })
    total: number;
 
}