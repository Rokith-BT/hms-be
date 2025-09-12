import { Controller, Post, Body } from '@nestjs/common';
import { OpHubPrescriptionService } from './op-hub-prescription.service';
import { ApiProperty, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ErrorResponse500 } from 'src/op-hub-appointment-status/op-hub-appointment-status.controller';
import { ErrorResponse400 } from 'src/op-hub-appointment/entities/op-hub-appointment.entity';
import { Prescription } from './entities/op-hub-prescription.entity';

export class CreatePrescriptionResponseDto {
  @ApiProperty({ example: 'success', description: 'The status of the response' })
  status: string;

  @ApiProperty({ example: 'Prescription added successfully', description: 'The message describing the result' })
  message: string;
}


export class GetPrescriptionResponseDto {
  @ApiProperty({ example: 'Prescription....', description: 'The name of the record' })
  record_name: string;

  @ApiProperty({ example: '_6f07dad7-34e8-4c8f-b564-d27c69e218cf.jpeg_1709716024863', description: 'File name associated with the prescription' })
  files: string;

  @ApiProperty({ example: null, description: 'Tags associated with the prescription, can be null', nullable: true })
  tags: string | null;

  @ApiProperty({ example: 405, description: 'Hospital outpatient department ID' })
  hos_opd_id: number;

  @ApiProperty({ example: null, description: 'Doctor’s name, can be null', nullable: true })
  doctorName: string | null;

  @ApiProperty({ example: '12th Jul 2024,09:00 AM', description: 'The appointment date and time' })
  appointDate: string;
}


@Controller('op-hub-prescription')
export class OpHubPrescriptionController {
  constructor(private readonly prescriptionService: OpHubPrescriptionService) { }

  @Post('/post')
  @ApiOperation({ summary: 'Create a new prescription' })
  @ApiResponse({
    status: 201,
    description: 'The prescription has been successfully created.',
    type: CreatePrescriptionResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponse500,
  })
  @ApiResponse({
    status: 400,
    description: 'Internal server error',
    type: ErrorResponse400,
  })
  create(@Body() createPrescriptionDto: Prescription) {
    return this.prescriptionService.create(createPrescriptionDto);
  }

  @Post('/get')
  @ApiOperation({ summary: 'Retrieve all prescriptions' })
  @ApiResponse({
    status: 200,
    description: 'List of all prescriptions retrieved successfully.',
    type: [GetPrescriptionResponseDto],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponse500,
  })
  @ApiResponse({
    status: 400,
    description: 'Internal server error',
    type: ErrorResponse400,
  })
  findAll(@Body() createPrescriptionDto: Prescription) {
    return this.prescriptionService.findAll(createPrescriptionDto);
  }

}
