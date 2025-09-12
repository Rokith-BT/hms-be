import { ApiProperty } from '@nestjs/swagger';

export class UpcomingAppointmentResponseDto {
    @ApiProperty({ example: 'Divyasri  Perumal' })
    patient_name: string;
  
    @ApiProperty({ example: 38 })
    patient_id: number;
  
    @ApiProperty({ example: '20th Apr 2025,03:01 PM', description: 'Formatted appointment date and time' })
    appointment_date: string;
  
    @ApiProperty({ example: '2025-04-20 15:01:00', description: 'Combined raw date and time' })
    comp: string;
  
    @ApiProperty({ example: '9080713455' })
    Mobile: string;
  
    @ApiProperty({ example: 'cardiologist,dermodology,Neurologist,Neurosurgery,Oncologist,Retina Specialist' })
    doctorSpecialist: string;
  
    @ApiProperty({ example: '91' })
    dial_code: string;
  
    @ApiProperty({ example: 742 })
    opd_id: number;
  
    @ApiProperty({ example: 543 })
    doctor: number;
  
    @ApiProperty({ example: 'Ms' })
    salutation: string;
  
    @ApiProperty({ example: 'Dr. developer N' })
    consultant: string;
  
    @ApiProperty({ example: 'Reserved' })
    appointment_status: string;
  
    @ApiProperty({ example: '2' })
    appointment_status_id: string;
  
    @ApiProperty({ example: 'APPOINTMENT' })
    module: string;
  
    @ApiProperty({ example: '#FFCB44' })
    color_code: string;
  
    @ApiProperty({ example: 'APPN686' })
    appointment_id: string;
  
    @ApiProperty({ example: 'unpaid' })
    payment_status: string;
  
    @ApiProperty({ example: 1.1 })
    apptFees: number;
  
    @ApiProperty({ example: ' - ' })
    appointment_token: string;
  }
  export class upcomingApptCountResponseDto {
    @ApiProperty({ type: [UpcomingAppointmentResponseDto] })
    details: UpcomingAppointmentResponseDto[];
  
    @ApiProperty({ example: 10 })
    count: any;
  
    
  }