import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OpHubClinicalNotesService } from './op-hub-clinical-notes.service';
import { CreateOpHubClinicalNoteDto } from './dto/create-op-hub-clinical-note.dto';
import { UpdateOpHubClinicalNoteDto } from './dto/update-op-hub-clinical-note.dto';
import { ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { ErrorResponse500 } from 'src/op-hub-appointment-status/op-hub-appointment-status.controller';
import { ErrorResponse400 } from 'src/op-hub-appointment/entities/op-hub-appointment.entity';
import { ClinicalNote } from './entities/op-hub-clinical-note.entity';

export class CreateClinicalNotesResponseDto {
  @ApiProperty({ example: 'success', description: 'The status of the response' })
  status: string;

  @ApiProperty({ example: 'Prescription added successfully', description: 'The message describing the result' })
  message: string;
}


export class GetclinicalNotesResponseDto {
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


@Controller('op-hub-clinical-notes')
export class OpHubClinicalNotesController {
  constructor(private readonly clinicalNotesService: OpHubClinicalNotesService) {}

  @Post('/post')
  @ApiOperation({ summary: 'Create a new prescription' })
  @ApiResponse({
    status: 201,
    description: 'The prescription has been successfully created.',
    type: CreateClinicalNotesResponseDto,
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
  create(@Body() createClinicalNoteDto: ClinicalNote) {
    return this.clinicalNotesService.create(createClinicalNoteDto);
  }

  @Post('/get')
  @ApiOperation({ summary: 'Retrieve all prescriptions' })
  @ApiResponse({
    status: 200,
    description: 'List of all prescriptions retrieved successfully.',
    type: [GetclinicalNotesResponseDto], // Indicates that the response is an array of Prescription objects
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
  findAll(@Body() createClinicalNoteDto: ClinicalNote) {
    return this.clinicalNotesService.findAll(createClinicalNoteDto);
  }

}


