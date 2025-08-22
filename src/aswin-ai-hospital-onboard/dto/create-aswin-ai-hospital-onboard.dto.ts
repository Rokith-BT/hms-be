
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEmail } from 'class-validator';

export class CreateAswinAiHospitalOnboardDto {
    @ApiProperty({ description: 'Health Facility ID', example: 'HF123456' })
    @IsString()
    @IsOptional()
    HealthFacilityID: string;

    @ApiProperty({ description: 'Hospital Name', example: 'Apollo Hospitals' })
    @IsString()
    @IsOptional()
    hospital_name: string;

    @ApiProperty({ description: 'Contact Number', example: '9876543210' })
    @IsString()
    @IsOptional()
    contact_no: string;

    @ApiProperty({ description: 'Consulting Charge', example: '200', default: '200' })
    @IsString()
    @IsOptional()
    hospital_consulting_charge?: string;

    @ApiProperty({ description: 'Opening Timing', example: '08:00 AM' })
    @IsString()
    @IsOptional()
    hospital_opening_timing: string;

    @ApiProperty({ description: 'Closing Timing', example: '08:00 PM' })
    @IsString()
    @IsOptional()
    hospital_closing_timing?: string;

    @ApiProperty({ description: 'Address', example: '123 Main Street, Chennai' })
    @IsString()
    @IsOptional()
    address: string;

    @ApiProperty({ description: 'State', example: 'Tamil Nadu' })
    @IsString()
    @IsOptional()
    state?: string;

    @ApiProperty({ description: 'District', example: 'Chennai' })
    @IsString()
    @IsOptional()
    district?: string;

    @ApiProperty({ description: 'Pincode', example: '600001' })
    @IsString()
    @IsOptional()
    pincode: string;

    @ApiProperty({ description: 'Website URL', example: 'https://www.apollohospitals.com' })
    @IsString()
    @IsOptional()
    website?: string;

    @ApiProperty({ description: 'Email ID', example: 'info@apollo.com' })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiProperty({ description: 'Registration Number', example: 'TNHOSP001' })
    @IsString()
    @IsOptional()
    hospital_reg_no: string;

    @ApiProperty({ description: 'Registration Date', example: '2022-01-01' })
    @IsString()
    @IsOptional()
    hospital_reg_date: string;

    @ApiProperty({ description: 'Registration Expiry Date', example: '2030-01-01' })
    @IsString()
    @IsOptional()
    hospital_reg_expiry_date: string;

    @ApiProperty({ description: 'Specialties as JSON array', example: '["Cardiology", "Neurology"]', type: 'array', isArray: true })
    @IsOptional()
    specialty?: any;

    @ApiProperty({ description: 'Array of Image path or URL', example: ['image1.jpg', 'image2.jpg'] })
    @IsOptional()
    image?: any;

    @ApiProperty({ description: 'Logo path or URL', example: '/uploads/logo.png' })
    @IsString()
    @IsOptional()
    logo?: string;

    @ApiProperty({ description: 'Total number of beds', example: 100 })
    @IsNumber()
    @IsOptional()
    bedcount?: number;

    @ApiProperty({ description: 'Overview of the hospital', example: 'Multi-specialty hospital established in 1990' })
    @IsString()
    @IsOptional()
    overview?: string;

    @ApiProperty({ description: 'Tax percentage', example: '18%' })
    @IsString()
    @IsOptional()
    tax_percentage?: string;

    @ApiProperty({ description: 'Tax amount', example: '36.00' })
    @IsString()
    @IsOptional()
    tax_amount?: string;

    @ApiProperty({ description: 'Latitude', example: '13.0827' })
    @IsString()
    @IsOptional()
    lattitude?: string;

    @ApiProperty({ description: 'Longitude', example: '80.2707' })
    @IsString()
    @IsOptional()
    longitude?: string;

    @ApiProperty({ description: 'HIP ID', example: 'HIP0001234' })
    @IsString()
    @IsOptional()
    hip_id: string;

    @ApiProperty({ description: 'Hospital Type', example: 'Clinic' })
    @IsString()
    @IsOptional()
    hospital_type: string;


    @ApiProperty({ description: 'hospital certificate', example: 'certifiate.pdf' })
    @IsString()
    @IsOptional()
    hospital_certificate: string;


    @ApiProperty({ description: 'country', example: 'India' })
    @IsString()
    @IsOptional()
    country: string;

    @ApiProperty({ description: 'HIP Name', example: 'Apollo HIP' })
    @IsString()
    @IsOptional()
    hip_name: string;

    @ApiProperty({ description: 'PHR API Base URL', example: 'https://phr.apollo.com/api' })
    @IsString()
    @IsOptional()
    phr_api_base_url: string;

    @ApiProperty({ description: 'OP Hub Base URL', example: 'https://ophub.apollo.com' })
    @IsString()
    @IsOptional()
    op_hub_base_url?: string;

    @ApiProperty({ description: 'secondary mobile no', example: '7092327667' })
    @IsString()
    @IsOptional()
    secondary_mobile_no?: string;

    @ApiProperty({ description: 'secondary mobile no', example: '7092327667' })
    @IsString()
    @IsOptional()
    primary_mobile_no_country_code?: string;


    @ApiProperty({ description: 'secondary mobile no', example: '7092327667' })
    @IsString()
    @IsOptional()
    secondary_mobile_no_country_code?: string;


}


