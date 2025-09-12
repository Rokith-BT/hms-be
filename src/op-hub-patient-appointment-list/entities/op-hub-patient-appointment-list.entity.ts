
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OpHubPatientAppointmentList {
    @ApiProperty({ example: 'new patient' })
    patient_name: string;

    @ApiProperty({ example: 23 })
    patient_id: number;

    @ApiProperty({ example: '16th May 2026,11:11 AM' })
    appointment_date: string;

    @ApiProperty({ example: '2026-05-16 11:11:11' })
    comp: string;

    @ApiProperty({ example: '9344269524' })
    Mobile: string;

    @ApiProperty({
        example: 'cardiologist,dermodology,Neurologist,Neurosurgery,Oncologist,Retina Specialist',
        description: 'Comma-separated list of doctor specialties',
    })
    doctorSpecialist: string;

    @ApiProperty({ example: '91' })
    dial_code: string;

    @ApiProperty({ example: 543 })
    doctor: number;

    @ApiProperty({ example: 'APPOINTMENT' })
    module: string;

    @ApiPropertyOptional({ example: 'APPN475_case_sheet.pdf_1743762338084', nullable: true })
    case_sheet_document?: string | null;

    @ApiProperty({ example: 'Dr. developer N' })
    consultant: string;

    @ApiProperty({ example: 'Completed' })
    appointment_status: string;

    @ApiProperty({ example: '6' })
    appointment_status_id: string;

    @ApiProperty({ example: '#00D65B' })
    color_code: string;

    @ApiProperty({ example: 'APPN404' })
    appointment_id: string;

    @ApiProperty({ example: 'paid' })
    payment_status: string;

    @ApiProperty({ example: 550 })
    apptFees: number;

    @ApiProperty({ example: 'OPDN449' })
    opd_id: string;

    @ApiProperty({ example: '2', description: 'Appointment token or "-" if empty' })
    appointment_token: string;
}

export class OpHubPatientAppointmentListCountResponse {
    @ApiProperty({ type: [OpHubPatientAppointmentList] })
    details: OpHubPatientAppointmentList[];

    @ApiProperty({ example: 10 })
    count: any;
}