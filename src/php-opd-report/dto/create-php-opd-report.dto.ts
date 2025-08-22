export class CreatePhpOpdReportDto {
    doctorId: number;
    fromAge : number;
    toAge : number;
    gender: string;
    symptoms: string;
    findings : string;
    fromDate: string;
    toDate: string;
}
import { ApiProperty } from '@nestjs/swagger';

export class OpdVisitDetailsDto {
  @ApiProperty({ example: 999 })
  id: number;

  @ApiProperty({ example: 'opd_no' })
  module_no: string;

  @ApiProperty({ example: 993 })
  visit_id: number;

  @ApiProperty({ example: null, description: 'Symptoms observed during visit', nullable: true })
  symptoms: string | null;

  @ApiProperty({ example: '2025-05-06T11:00:00.000Z', type: String, format: 'date-time' })
  appointment_date: string;

  @ApiProperty({ example: null, description: 'Doctor’s finding description', nullable: true })
  finding_description: string | null;

  @ApiProperty({ example: null, nullable: true })
  patient_name: string | null;

  @ApiProperty({ example: null, type: String, nullable: true })
  dob: string | null;

  @ApiProperty({ example: null, nullable: true })
  age: number | null;

  @ApiProperty({ example: null, nullable: true })
  month: number | null;

  @ApiProperty({ example: null, nullable: true })
  day: number | null;

  @ApiProperty({ example: null, nullable: true })
  gender: string | null;

  @ApiProperty({ example: null, nullable: true })
  mobileno: string | null;

  @ApiProperty({ example: null, nullable: true })
  guardian_name: string | null;

  @ApiProperty({ example: null, nullable: true })
  address: string | null;

  @ApiProperty({ example: null, nullable: true })
  patientid: number | null;

  @ApiProperty({ example: 'dev' })
  name: string;

  @ApiProperty({ example: 'k' })
  surname: string;

  @ApiProperty({ example: 'IIT1578' })
  employee_id: string;
}
export class OpdReportResponseDto {
  @ApiProperty({ type: [OpdVisitDetailsDto] })
  details: OpdVisitDetailsDto[];

  @ApiProperty({ example: 100 })
  count: number;
}