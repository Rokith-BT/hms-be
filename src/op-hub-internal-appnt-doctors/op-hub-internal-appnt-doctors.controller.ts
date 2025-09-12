import { Controller, Get, Query } from '@nestjs/common';
import { OpHubInternalAppntDoctorsService } from './op-hub-internal-appnt-doctors.service';
import { ApiOperation, ApiProperty, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ErrorResponse500 } from 'src/op-hub-appointment-status/op-hub-appointment-status.controller';
import { ErrorResponse400 } from 'src/op-hub-appointment/entities/op-hub-appointment.entity';

export class DoctorDto {
  @ApiProperty({ example: 98, description: 'ID of the doctor' })
  doctorId: number;

  @ApiProperty({ example: 'Dr. Matheshwari N', description: 'Name of the doctor' })
  doctorName: string;
}

@Controller('op-hub-internal-appnt-doctors')
export class OpHubInternalAppntDoctorsController {
  constructor(private readonly internalAppntDoctorsService: OpHubInternalAppntDoctorsService) { }

  @Get()
  @ApiOperation({ summary: 'Retrieve all doctors' })
  @ApiQuery({
    name: 'hospital_id',
    required: true,
    description: 'The ID of the hospital to filter the doctors',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'List of doctors retrieved successfully.',
    type: [DoctorDto],
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
  findAll(@Query('hospital_id') hospital_id: number) {
    return this.internalAppntDoctorsService.findAll(hospital_id);
  }

}
