import { ApiProperty } from '@nestjs/swagger';

export class PatientBalanceDto {
    @ApiProperty({ example: 'Naveenkumar K', description: 'Name of the patient' })
    patient_name: string;

    @ApiProperty({ example: 5, description: 'Unique ID of the patient' })
    patientID: number;

    @ApiProperty({ example: '1234241242', description: 'Mobile number of the patient' })
    mobileno: string;

    @ApiProperty({ example: 'venktrmn2114@gmail.com', description: 'Email address of the patient', required: false })
    email: string;

    @ApiProperty({ example: 4.4, description: 'Outstanding balance amount for the patient' })
    balanceAmount: number;
}

export class PatientBalanceDtoWithCount {
    @ApiProperty({ example: 1, description: 'Total number of patients' })
    Count: number;

    @ApiProperty({ example: 1, description: 'Total Amount' })
    total: number;

    @ApiProperty({ type: [PatientBalanceDto] })
    PendingList: PatientBalanceDto[];
}