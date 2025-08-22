import { Controller, Post, Query } from '@nestjs/common';
import { OpHubCompleteAndCloseConsultationService } from './op-hub-complete-and-close-consultation.service';
import { ApiOperation, ApiResponse, ApiQuery, ApiProperty } from '@nestjs/swagger';

export class CompleteConsultationResponseDto {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'consultation completed successfully' })
  message: string;
}

export class VerificationResponseDto {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'Token verified successfully' })
  message: string;
}


@Controller('op-hub-complete-and-close-consultation')
export class OpHubCompleteAndCloseConsultationController {
  constructor(private readonly completeAndCloseConsultationService: OpHubCompleteAndCloseConsultationService) { }

  @Post('/verification')
  @ApiOperation({ summary: 'Verify token by hospital ID and appointment number' })
  @ApiResponse({
    status: 200,
    description: 'Token verified successfully',
    type: VerificationResponseDto,
  })
  @ApiQuery({ name: 'hospital_id', required: true, type: Number })
  @ApiQuery({ name: 'appointment_number', required: true, type: String })
  findAll(@Query('hospital_id') hospital_id: number,
    @Query('appointment_number') appointment_number: string) {
    return this.completeAndCloseConsultationService.findAll(hospital_id, appointment_number);
  }


  @Post('/complete')
  @ApiOperation({ summary: 'Complete consultation by hospital ID and appointment number' })
  @ApiResponse({
    status: 200,
    description: 'Consultation completed successfully',
    type: CompleteConsultationResponseDto,
  })
  @ApiQuery({ name: 'hospital_id', required: true, type: Number })
  @ApiQuery({ name: 'appointment_number', required: true, type: String })
  findAllcomplete(@Query('hospital_id') hospital_id: number,
    @Query('appointment_number') appointment_number: string) {
    return this.completeAndCloseConsultationService.findAllcomplete(hospital_id, appointment_number);
  }

}
