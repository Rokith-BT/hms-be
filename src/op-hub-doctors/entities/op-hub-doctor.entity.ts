import { ApiProperty } from '@nestjs/swagger';

export class DoctorDetailsDto {
    @ApiProperty({ example: 'Dr. developer N' })
    doctor_name: string;

    @ApiProperty({ example: 'jayam4413@gmail.com' })
    email: string;

    @ApiProperty({ example: 543 })
    doctor_id: number;

    @ApiProperty({ example: 'Male' })
    gender: string;

    @ApiProperty({ example: 'IMG_0051.jpeg_1737956397066' })
    image: string;

    @ApiProperty({ example: 'MBBS MD' })
    qualification: string;

    @ApiProperty({ example: '10', description: 'Years of experience, can be empty string' })
    experience: string;

    @ApiProperty({ example: '3', description: 'Rating out of 5, can be "-" if not rated' })
    rating: string;

    @ApiProperty({ example: 'dermodology' })
    specialist_names: string;

    @ApiProperty({ example: 1, nullable: true })
    standard_charge: number | null;

    @ApiProperty({ example: 'Plenome' })
    hospital_name: string;

    @ApiProperty({ example: '10:00:00 - 23:59:59' })
    hospital_opening_timing: string;

    @ApiProperty({ example: 1, nullable: true })
    charge_id: number | null;

    @ApiProperty({ example: '10.00%', nullable: true })
    tax_percentage: string | null;

    @ApiProperty({ example: 0.1, nullable: true })
    tax: number | null;

    @ApiProperty({ example: 1.1, nullable: true })
    Totalamount: number | null;
}

export class DoctorDetailsCountDto {
    @ApiProperty({ type: [DoctorDetailsDto], description: 'Array of doctor details' })
    details: DoctorDetailsDto[];

    @ApiProperty({ example: 100, description: 'Total count of doctor details' })
    count: any;
}