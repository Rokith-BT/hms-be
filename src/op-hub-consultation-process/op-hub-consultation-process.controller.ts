import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { OpHubConsultationProcessService } from './op-hub-consultation-process.service';
import { CreateOpHubConsultationProcessDto } from './dto/create-op-hub-consultation-process.dto';
import { UpdateOpHubConsultationProcessDto } from './dto/update-op-hub-consultation-process.dto';
import { ApiProperty, ApiOperation, ApiQuery, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ErrorResponse500 } from 'src/op-hub-appointment-status/op-hub-appointment-status.controller';
import { ErrorResponse400 } from 'src/op-hub-appointment/entities/op-hub-appointment.entity';
import { Consultation } from './entities/op-hub-consultation-process.entity';

export class ProcessTrackHistoryDto {
  @ApiProperty({ example: 45, description: 'The unique ID of the record' })
  id: number;

  @ApiProperty({ example: 45, description: 'The consultation process tracking ID' })
  consultation_process_tracking_id: number;

  @ApiProperty({ example: 2, description: 'The ID of the consultation process color code' })
  consultation_process_color_code_id: number;

  @ApiProperty({ example: 405, description: 'The ID of the staff member associated with this record' })
  staff_id: number | null;

  @ApiProperty({ example: '2024-06-29T05:32:59.000Z', description: 'The date and time the record was created' })
  created_at: string;

  @ApiProperty({ example: '2024-06-29T05:32:59.000Z', description: 'The date and time the record was last updated' })
  updated_time: string;
}

export class ProcessDto {
  @ApiProperty({ example: 1, description: 'The unique ID of the process' })
  id: number;

  @ApiProperty({ example: 'X-RAY', description: 'The name of the process' })
  process_name: string;

  @ApiProperty({ example: 'X-RAY description', description: 'A brief description of the process' })
  process_description: string;

  @ApiProperty({ example: '2024-05-06T13:19:07.000Z', description: 'The date and time the process was created' })
  created_at: string;

  @ApiProperty({ example: null, description: 'The latitude associated with the process, if any' })
  lattitude: number | null;

  @ApiProperty({ example: null, description: 'The longitude associated with the process, if any' })
  longitude: number | null;
}

export class ConsultationProcessStatsDto {
  @ApiProperty({ example: 1, description: 'The ID of the consultation process status' })
  id: number;

  @ApiProperty({ example: 'Waiting', description: 'The name of the consultation process status' })
  name: string;

  @ApiProperty({ example: '#FFC52F', description: 'The color code associated with the process status' })
  color_code: string;

  @ApiProperty({ example: '2024-05-06T13:09:38.000Z', description: 'The date and time the status was created' })
  created_at: string;

  @ApiProperty({ example: '0', description: 'The count of consultations in this process status' })
  count: string;
}


export class StatusDto {
  @ApiProperty({ example: 1, description: 'Unique identifier for the status' })
  id: number;

  @ApiProperty({ example: 'Waiting', description: 'Name of the status' })
  name: string;

  @ApiProperty({ example: '#FFC52F', description: 'Color code associated with the status' })
  color_code: string;

  @ApiProperty({ example: '2024-05-06T13:09:38.000Z', description: 'Creation timestamp of the status' })
  created_at: string;
}

export class ConsultationProcessDto {
  @ApiProperty({ example: null, description: 'The name of the doctor, if assigned' })
  doctor: string | null;

  @ApiProperty({ example: 'X-RAY description', description: 'Description of the consultation process' })
  description: string;

  @ApiProperty({ example: 'X-RAY', description: 'Name of the consultation process' })
  Consultation_Process: string;

  @ApiProperty({ example: '#FFC52F', description: 'Color code associated with the consultation process' })
  color_code: string;

  @ApiProperty({ example: 'Waiting', description: 'Current status of the consultation process' })
  status: string;

  @ApiProperty({ example: '12th Jul 2024 10:00 AM', description: 'Timing of the consultation process' })
  timing: string;
}

export class UpdateConsultationResponseDto {
  @ApiProperty({ example: 'success', description: 'The status of the operation' })
  status: string;

  @ApiProperty({ example: 'Prescription updated successfully', description: 'The message indicating the result of the operation' })
  message: string;
}


@Controller('op-hub-consultation-process')
export class OpHubConsultationProcessController {
  constructor(private readonly ConsultationService: OpHubConsultationProcessService) {}

  @Get()

  @ApiOperation({ summary: 'Retrieve all color codes based on hospital ID' })
  @ApiQuery({ name: 'hospital_id', required: true, description: 'ID of the hospital', type: Number })
  @ApiResponse({ status: 200, description: 'List of color codes retrieved successfully', type: [StatusDto] }) // Update with the correct DTO


  @ApiResponse({
    status: 404,
    description: 'Patient charge not found.',
  })

  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
    type: ErrorResponse400
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500
  })
  async findAll(@Query('hospital_id') hospital_id: number) {
    return this.ConsultationService.findAllColorCode(hospital_id);
  }

  @Get('process')
  @ApiOperation({ summary: 'Get the list of processes for a hospital' })
  @ApiQuery({ name: 'hospital_id', required: true, description: 'The ID of the hospital' })
  @ApiResponse({
    status: 200,
    description: 'List of processes for the specified hospital',
    type: [ProcessDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Patient charge not found.',
  })

  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
    type: ErrorResponse400
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500
  })
  async findAllprocess(@Query('hospital_id') hospital_id: number) {
    return this.ConsultationService.findAllProcessList(hospital_id);
  }



  @Get('tracking')

  @ApiOperation({ summary: 'Get the tracking details of consultation processes' })
  @ApiResponse({
    status: 200,
    description: 'List of consultation process tracking details',
    type: [ConsultationProcessDto], // Use the DTO class that represents the response structure
  })
  async findAllprocesstrack(@Query('hospital_id') hospital_id: number, @Query('appointment_id') appointment_id: string) {
    return this.ConsultationService.findAllProcessTrackList(hospital_id, appointment_id);
  }


  @Get('process-history')
  @ApiOperation({ summary: 'Get the consultation process track history' })
  @ApiQuery({ name: 'hospital_id', required: true, description: 'The ID of the hospital' })
  @ApiResponse({
    status: 200,
    description: 'The consultation process track history records',
    type: [ProcessTrackHistoryDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Patient charge not found.',
  })

  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
    type: ErrorResponse400
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500
  })
  async findAllprocesstrackhistory(@Query('hospital_id') hospital_id: number) {
    return this.ConsultationService.ProcessTrackHistory(hospital_id);
  }


  @Get('stats')
  @ApiOperation({ summary: 'Get stats of consultation' })
  @ApiQuery({ name: 'hospital_id', required: true, description: 'The ID of the hospital' })
  @ApiQuery({ name: 'appointment_id', required: true, description: 'The appointment ID' })
  @ApiResponse({
    status: 200,
    description: 'The consultation process statistics',
    type: [ConsultationProcessStatsDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Patient charge not found.',
  })

  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
    type: ErrorResponse400
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500
  })
  async getConsultationProcessStats(@Query('hospital_id') hospital_id: number, @Query('appointment_id') appointment_id: string) {
    return this.ConsultationService.gettrackstats(hospital_id, appointment_id);
  }



  @Post()
  @ApiOperation({ summary: 'Consultation status add or update for an appointment' })

  @ApiBody({ type: Consultation, description: 'Data required to update or create a consultation' })
  @ApiResponse({
    status: 200,
    description: 'The consultation has been successfully updated or created',
    type: [UpdateConsultationResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Patient charge not found.',
  })

  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
    type: ErrorResponse400
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500
  })
  async updateOrCreateConsultation(
    @Body() updateConsultation: Consultation,
  ): Promise<any> {

    return this.ConsultationService.update(updateConsultation);

  }


}
