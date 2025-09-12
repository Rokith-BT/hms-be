import { Controller, Get, Query } from '@nestjs/common';
import { OpHubDoctorsService } from './op-hub-doctors.service';
import {
  ApiProperty,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { ErrorResponse500 } from 'src/op-hub-appointment-status/op-hub-appointment-status.controller';
import { ErrorResponse400 } from 'src/op-hub-appointment/entities/op-hub-appointment.entity';

export class DoctorDto {
  @ApiProperty({
    example: 'Dr. Matheshwari N',
    description: 'Name of the doctor',
  })
  doctor_name: string;

  @ApiProperty({
    example: 'matheswari@plenome.com',
    description: 'Email of the doctor',
  })
  email: string;

  @ApiProperty({ example: 98, description: 'ID of the doctor' })
  doctor_id: number;

  @ApiProperty({ example: 'Male', description: 'Gender of the doctor' })
  gender: string;

  @ApiProperty({
    example: 'Screenshot from 2024-02-07 12-14-29.png_1709713145092',
    description: 'Image filename of the doctor',
  })
  image: string;

  @ApiProperty({ example: 'MBBS', description: 'Qualification of the doctor' })
  qualification: string;

  @ApiProperty({ example: '10', description: 'Years of experience' })
  experience: string;

  @ApiProperty({ example: '4', description: 'Rating of the doctor' })
  rating: string;

  @ApiProperty({
    example: 'cardiologist',
    description: 'Specialization of the doctor',
  })
  specialist_names: string;

  @ApiProperty({
    example: 100,
    description: 'Standard charge for the doctor consultation',
  })
  standard_charge: number;

  @ApiProperty({
    example: 'Plenome Hospital',
    description: 'Name of the hospital where the doctor practices',
  })
  hospital_name: string;

  @ApiProperty({
    example: '09:00:00 - 10:00:00',
    description: 'Hospital opening timings',
  })
  hospital_opening_timing: string;

  @ApiProperty({
    example: 13,
    description: 'Charge ID associated with the doctor',
  })
  charge_id: number;

  @ApiProperty({
    example: '10.00%',
    description: 'Tax percentage applicable to the charge',
  })
  tax_percentage: string;

  @ApiProperty({ example: 10, description: 'Calculated tax amount' })
  tax: number;

  @ApiProperty({ example: 110, description: 'Total amount to be paid' })
  Totalamount: number;
}

@Controller('op-hub-doctors')
export class OpHubDoctorsController {
  constructor(private readonly doctorsService: OpHubDoctorsService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve list of doctors based on filters' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term to filter doctors by name or email',
  })
  @ApiQuery({
    name: 'hospital_id',
    required: true,
    description: 'Hospital ID to filter doctors',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Date to filter doctors based on availability',
  })
  @ApiQuery({
    name: 'gender',
    required: false,
    description: 'Gender to filter doctors',
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
  findAll(
    @Query('search') search: string,
    @Query('hospital_id') hospital_id: number,
    @Query('date') date: any,
    @Query('gender') gender: string,
  ) {
    return this.doctorsService.findAll(search, hospital_id, date, gender);
  }

  @Get('/v2')
  @ApiOperation({ summary: 'Retrieve list of doctors based on filters' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term to filter doctors by name or email',
  })
  @ApiQuery({
    name: 'hospital_id',
    required: true,
    description: 'Hospital ID to filter doctors',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Date to filter doctors based on availability',
  })
  @ApiQuery({
    name: 'gender',
    required: false,
    description: 'Gender to filter doctors',
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
  async findAllV2(
    @Query('search') search: string,
    @Query('hospital_id') hospital_id: number,
    @Query('date') date: any,
    @Query('gender') gender: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    if (!hospital_id) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS_V2,
        message: process.env.HOSPITAL_ID_ERR_V2,
      };
    }
    try {
      let final_out = await this.doctorsService.findAllV2(
        search,
        hospital_id,
        date,
        gender,
        +limit || 10,
        +page || 1,
      );
      if (final_out?.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.SUCCESS_MESSAGE_V2,
          data: final_out.details,
          total: final_out.count,
        };
      } else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.DATA_NOT_FOUND_V2,
          data: [],
        };
      }
    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_V2,
        status: process.env.ERROR_STATUS_V2,
        message: process.env.ERROR_MESSAGE_V2,
      };
    }
  }

  @Get('/v3')
  async findallv3(
    @Query('hospital_id') hospital_id: number,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    const asdf = await this.doctorsService.findallV3(
      hospital_id,
      limit || 10,
      page || 1,
    );
    return asdf;
  }
  @Get('/getDocName')
  async getDocName(
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    const docName = await this.doctorsService.getDocName(
      limit || 10,
      page || 1,
    );
    return docName;
  }
}
