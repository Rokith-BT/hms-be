import { Controller, Post, Body } from '@nestjs/common';
import { OpHubVitalsService } from './op-hub-vitals.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ErrorResponse500 } from 'src/op-hub-appointment-status/op-hub-appointment-status.controller';
import { ErrorResponse400 } from 'src/op-hub-appointment/entities/op-hub-appointment.entity';
import { CreatePrescriptionResponseDto, GetPrescriptionResponseDto } from 'src/op-hub-prescription/op-hub-prescription.controller';
import { Vital } from './entities/op-hub-vital.entity';

@Controller('op-hub-vitals')
export class OpHubVitalsController {
  constructor(private readonly vitalsService: OpHubVitalsService) { }

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
  create(@Body() createPrescriptionDto: Vital) {
    return this.vitalsService.create(createPrescriptionDto);
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
  findAll(@Body() createPrescriptionDto: Vital) {
    return this.vitalsService.findAll(createPrescriptionDto);
  }


}
