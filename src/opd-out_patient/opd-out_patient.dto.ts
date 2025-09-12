import { ApiProperty } from '@nestjs/swagger';

export class opdOutPatientDto1 {

    @ApiProperty({ example: '335' })
    cons_doctor: number;

    @ApiProperty({ example: 'normal' })
    case_type: string;

    @ApiProperty({ example: '2025-04-07 15:07:11' })
    appointment_date: any;

    @ApiProperty({ example: '3' })
    symptoms_type: number;

    @ApiProperty({ example: '1' })
    symptoms: any;

    @ApiProperty({ example: '98' })
    spo2: string;

    @ApiProperty({ example: '110' })
    bp: string;

    @ApiProperty({ example: '5.3' })
    height: string;

    @ApiProperty({ example: '98' })
    weight: string;

    @ApiProperty({ example: '72' })
    pulse: string;

    @ApiProperty({ example: '98' })
    temperature: string;

    @ApiProperty({ example: '70' })
    respiration: string;

    @ApiProperty({ example: 'no' })
    known_allergies: string;

    @ApiProperty({ example: 'no' })
    patient_old: string;

    @ApiProperty({ example: 'no' })
    casualty: string;

    @ApiProperty({ example: 'doctor' })
    refference: string;

    @ApiProperty({ example: '2025-04-07' })
    date: any;

    @ApiProperty({ example: 'this is the note' })
    note: string;

    @ApiProperty({ example: 'offline' })
    payment_mode: string;

    @ApiProperty({ example: '98' })
    generated_by: string;

    @ApiProperty({ example: 'yes' })
    live_consult: string;

    @ApiProperty({ example: 'yes' })
    can_delete: string;

    @ApiProperty({ example: '2025-04-02 10:52:32' })
    payment_date: string;

    @ApiProperty({ example: '11:11:11' })
    time: string;

    @ApiProperty({ example: '2000' })
    standard_charge: number;

    @ApiProperty({ example: '1' })
    charge_id: number;

    @ApiProperty({ example: '0.00' })
    tpa_charge: number;

    @ApiProperty({ example: '10.00' })
    tax: number;

    @ApiProperty({ example: '1200.00' })
    apply_charge: number;

    @ApiProperty({ example: '100' })
    amount: string;


    @ApiProperty({ example: "razorpay" })
    payment_gateway: any;

    @ApiProperty({ example: 'rzp_liveZsdSe' })
    payment_id: any;

    @ApiProperty({ example: '24456552' })
    payment_reference_number: any;

    @ApiProperty({ example: '25' })
    patient_id: any;

    @ApiProperty({ example: 1 })
    Hospital_id: number;

}

export class CountDto {
    @ApiProperty({ example: '10' })
    details: opdOutPatientDto1[];

    @ApiProperty({ example: '10' })
    total: number;

    @ApiProperty({ example: '10' })
    limit: number;


}