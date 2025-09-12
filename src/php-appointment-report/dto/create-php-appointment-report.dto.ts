export class CreatePhpAppointmentReportDto {
    fromDate: string;
    toDate: string;
    doctorId: number;
    shiftId: number;
    priority: number;
    source: string;
}


import { ApiProperty } from '@nestjs/swagger';

export class PhpAppointmentReportResponseDto {
  @ApiProperty() id: number;
  @ApiProperty() patient_id: number;
  @ApiProperty() case_reference_id: number;
  @ApiProperty() visit_details_id: number;
  @ApiProperty({ example: '2025-12-23' }) date: string;
  @ApiProperty({ example: '09:00:00' }) time: string;
  @ApiProperty() priority: number;
  @ApiProperty({ nullable: true }) specialist: string | null;
  @ApiProperty() doctor: number;
  @ApiProperty({ example: '1.1' }) amount: string;
  @ApiProperty({ nullable: true }) message: string | null;
  @ApiProperty({ example: 'Reserved' }) appointment_status: string;
  @ApiProperty({ example: 'Offline' }) source: string;
  @ApiProperty({ nullable: true }) is_opd: boolean | null;
  @ApiProperty({ nullable: true }) is_ipd: boolean | null;
  @ApiProperty() global_shift_id: number;
  @ApiProperty() shift_id: number;
  @ApiProperty({ nullable: true }) is_queue: boolean | null;
  @ApiProperty({ example: 'no' }) live_consult: string;
  @ApiProperty({ example: '2025-03-24T12:31:59.000Z' }) created_at: string;
  @ApiProperty({ nullable: true }) appointment_cancellation_reason: string | null;
  @ApiProperty({ example: '2' }) appointment_status_id: string;
  @ApiProperty() is_token_verified: number;
  @ApiProperty() is_consultation_closed: number;
  @ApiProperty({ example: 'APPOINTMENT' }) module: string;

  // From patients table
  @ApiProperty({ example: '5423698745' }) mobileno: string;
  @ApiProperty({ example: '' }) email: string;
  @ApiProperty({ example: 'Male' }) gender: string;
  @ApiProperty({ example: 1.1 }) paid_amount: number;
  @ApiProperty({ example: 'Gorden Borer' }) patient_name: string;

  // From staff table
  @ApiProperty({ example: 'developer' }) name: string;
  @ApiProperty({ example: 'N' }) surname: string;
  @ApiProperty({ example: 'IIT199' }) employee_id: string;
}

export class CountResponseDto {
    @ApiProperty({ example: 1 }) count: number;
    @ApiProperty({ type: [PhpAppointmentReportResponseDto] })
    details: PhpAppointmentReportResponseDto[];
}


