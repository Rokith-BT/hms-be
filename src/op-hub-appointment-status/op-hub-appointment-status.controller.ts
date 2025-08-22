import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { OpHubAppointmentStatusService } from './op-hub-appointment-status.service';
import { CreateOpHubAppointmentStatusDto } from './dto/create-op-hub-appointment-status.dto';
import { UpdateOpHubAppointmentStatusDto } from './dto/update-op-hub-appointment-status.dto';
import { ApiProperty, ApiOperation, ApiResponse } from '@nestjs/swagger';

export class ErrorResponse500 {
  @ApiProperty({ example: 500 })
  statusCode: number;

  @ApiProperty({ example: 'Internal server error' })
  message: string;
}

export class AppointmentStatusResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Requested' })
  status: string;

  @ApiProperty({ example: '2024-04-25T05:23:23.000Z' })
  create_time: string;

  @ApiProperty({ example: '#F59E0B' })
  color_code: string;
}

@Controller('op-hub-appointment-status')
export class OpHubAppointmentStatusController {
  constructor(private readonly appointmentStatusService: OpHubAppointmentStatusService) {}


  @Get()
  @ApiOperation({ summary: 'Get all appointment statuses for a hospital' })
  @ApiResponse({
    status: 200,
    description: 'List of appointment statuses.',
    type: [AppointmentStatusResponse]
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
  })
  @ApiResponse({
    status: 404,
    description: 'Appointment not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponse500
  })
  findAll(@Query('hospital_id') hospital_id: number) {
    return this.appointmentStatusService.findAll(hospital_id);
  }

  @Get('/tracking')
  @ApiOperation({ summary: 'Track the status of a specific appointment' })
  @ApiResponse({
    status: 200,
    description: 'Appointment status tracking details.',
    type: [AppointmentStatusResponse]
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
  })
  @ApiResponse({
    status: 404,
    description: 'Appointment not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponse500
  })
  getStatusTracking(
    @Query('hospital_id') hospital_id: number,
    @Query('appointment_id') appointment_id: string,
  ) {
    return this.appointmentStatusService.appointment_status_tracking(hospital_id, appointment_id);
  }

  @Get('/statusList')
  @ApiOperation({ summary: 'Get a list of statuses for tracking' })
  @ApiResponse({
    status: 200,
    description: 'List of statuses for tracking.',
    type: [AppointmentStatusResponse]
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
  })
  @ApiResponse({
    status: 404,
    description: 'Appointment not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponse500
  })
  listForTracking(@Query('hospital_id') hospital_id: number) {
    return this.appointmentStatusService.findAllForTracking(hospital_id);
  }
}
